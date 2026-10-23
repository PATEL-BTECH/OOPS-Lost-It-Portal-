/**
 * Physical Locker & Custody Controller
 * Campus Lost & Found Portal
 * Module Lead: Neerja (Security Desk & Physical Custody)
 */
const Locker = require('../models/locker.model');
const FoundItem = require('../models/foundItem.model');
const { CUSTODY_LOCATIONS } = require('../config/custodyLocations');

const INITIAL_LOCKERS = [
  { lockerNumber: 'LKR-A01', label: 'Zone A - Safe Locker 01', zone: 'Zone A', capacityType: 'Safe' },
  { lockerNumber: 'LKR-A02', label: 'Zone A - Safe Locker 02', zone: 'Zone A', capacityType: 'Safe' },
  { lockerNumber: 'LKR-A03', label: 'Zone A - Safe Locker 03', zone: 'Zone A', capacityType: 'Safe' },
  { lockerNumber: 'LKR-A04', label: 'Zone A - Safe Locker 04', zone: 'Zone A', capacityType: 'Safe' },
  { lockerNumber: 'LKR-B01', label: 'Zone B - Vault Locker 01', zone: 'Zone B', capacityType: 'Vault' },
  { lockerNumber: 'LKR-B02', label: 'Zone B - Vault Locker 02', zone: 'Zone B', capacityType: 'Vault' },
  { lockerNumber: 'LKR-B03', label: 'Zone B - Vault Locker 03', zone: 'Zone B', capacityType: 'Vault' },
  { lockerNumber: 'LKR-B04', label: 'Zone B - Vault Locker 04', zone: 'Zone B', capacityType: 'Vault' },
  { lockerNumber: 'LKR-C01', label: 'Zone C - Storage Bin 01', zone: 'Zone C', capacityType: 'Bin' },
  { lockerNumber: 'LKR-C02', label: 'Zone C - Storage Bin 02', zone: 'Zone C', capacityType: 'Bin' },
  { lockerNumber: 'LKR-C03', label: 'Zone C - Storage Bin 03', zone: 'Zone C', capacityType: 'Bin' },
  { lockerNumber: 'LKR-C04', label: 'Zone C - Storage Bin 04', zone: 'Zone C', capacityType: 'Bin' },
  { lockerNumber: 'LKR-D01', label: 'Zone D - Equipment Bay 01', zone: 'Zone D', capacityType: 'Bay' },
  { lockerNumber: 'LKR-D02', label: 'Zone D - Equipment Bay 02', zone: 'Zone D', capacityType: 'Bay' },
  { lockerNumber: 'LKR-D03', label: 'Zone D - Equipment Bay 03', zone: 'Zone D', capacityType: 'Bay' },
  { lockerNumber: 'LKR-D04', label: 'Zone D - Equipment Bay 04', zone: 'Zone D', capacityType: 'Bay' }
];

/**
 * GET /api/lockers
 * List all campus storage lockers with occupancy and linked items.
 * Automatically seeds 16 lockers (Zones A-D) on first run if database is empty.
 */
const getLockers = async (req, res, next) => {
  try {
    const existingCount = await Locker.countDocuments();
    if (existingCount === 0) {
      await Locker.insertMany(INITIAL_LOCKERS);
    }

    const lockers = await Locker.find()
      .populate({
        path: 'currentFoundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation verificationDetails reportedBy',
        populate: [
          { path: 'category', select: 'name icon' },
          { path: 'reportedBy', select: 'name email phone' }
        ]
      })
      .populate('assignedBy', 'name email role')
      .sort({ lockerNumber: 1 });

    const total = lockers.length;
    const occupied = lockers.filter((l) => l.status === 'occupied').length;
    const vacant = lockers.filter((l) => l.status === 'vacant').length;
    const maintenance = lockers.filter((l) => l.status === 'maintenance').length;

    res.status(200).json({
      success: true,
      summary: {
        total,
        occupied,
        vacant,
        maintenance,
        occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0
      },
      custodyLocations: CUSTODY_LOCATIONS,
      lockers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lockers/custody-locations
 * Returns configurable campus custody intake points
 */
const getCustodyLocations = async (req, res) => {
  res.status(200).json({
    success: true,
    locations: CUSTODY_LOCATIONS
  });
};

/**
 * POST /api/lockers/assign
 * Assign an incoming or verified found item to a physical locker.
 * Strictly controlled: Updates locker state to 'occupied' and synchronizes item storageLocation.
 */
const assignLocker = async (req, res, next) => {
  try {
    const { lockerId, foundItemId, custodyLocationId, notes } = req.body;

    if (!lockerId || !foundItemId) {
      return res.status(400).json({
        success: false,
        message: 'Locker ID and Found Item ID are required.'
      });
    }

    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({
        success: false,
        message: 'Physical locker not found.'
      });
    }

    if (locker.status !== 'vacant') {
      return res.status(400).json({
        success: false,
        message: `Locker ${locker.lockerNumber} is currently ${locker.status}. Please select a vacant locker.`
      });
    }

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'Found item record not found.'
      });
    }

    if (foundItem.status === 'handed_over') {
      return res.status(400).json({
        success: false,
        message: 'Item has already been handed over to claimant and cannot be reassigned.'
      });
    }

    // If item was previously in another locker, vacate that locker first
    const previousLocker = await Locker.findOne({ currentFoundItem: foundItem._id, _id: { $ne: locker._id } });
    if (previousLocker) {
      previousLocker.status = 'vacant';
      previousLocker.currentFoundItem = null;
      previousLocker.assignedBy = null;
      previousLocker.assignedAt = null;
      if (previousLocker.history && previousLocker.history.length > 0) {
        const last = previousLocker.history[previousLocker.history.length - 1];
        if (!last.releasedAt) {
          last.releasedAt = new Date();
          last.releasedBy = req.user._id;
          last.notes = `Relocated to ${locker.lockerNumber}`;
        }
      }
      await previousLocker.save();
    }

    // Determine custody location label
    const custodyLoc = CUSTODY_LOCATIONS.find((loc) => loc.id === custodyLocationId) || CUSTODY_LOCATIONS[1];

    // Assign to new locker
    locker.status = 'occupied';
    locker.currentFoundItem = foundItem._id;
    locker.assignedBy = req.user._id;
    locker.assignedAt = new Date();
    locker.history.push({
      foundItem: foundItem._id,
      itemName: foundItem.name,
      assignedBy: req.user._id,
      assignedAt: new Date(),
      notes: notes || `Deposited into physical custody at ${custodyLoc.name}`
    });
    await locker.save();

    // Update FoundItem
    foundItem.handedToSecurity = true;
    foundItem.securityReceivedBy = req.user._id;
    foundItem.storageLocation = `Locker ${locker.lockerNumber} (${custodyLoc.name})`;
    foundItem.custodyLocation = custodyLoc.id;
    foundItem.assignedLocker = locker._id;
    await foundItem.save();

    const populatedLocker = await Locker.findById(locker._id)
      .populate({
        path: 'currentFoundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate('assignedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: `Item "${foundItem.name}" securely locked into ${locker.lockerNumber}.`,
      locker: populatedLocker,
      foundItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/lockers/:id/relocate
 * Safely move an item from one locker to another or release back to intake desk
 */
const vacateLocker = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const locker = await Locker.findById(req.params.id);

    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found.' });
    }

    if (locker.status !== 'occupied') {
      return res.status(400).json({
        success: false,
        message: `Locker ${locker.lockerNumber} is not occupied.`
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A specific reason (min 5 chars) is required for audit logs.'
      });
    }

    if (locker.currentFoundItem) {
      const foundItem = await FoundItem.findById(locker.currentFoundItem);
      if (foundItem) {
        foundItem.storageLocation = `Security Desk (Pending Relocation: ${reason})`;
        foundItem.assignedLocker = null;
        await foundItem.save();
      }
    }

    if (locker.history && locker.history.length > 0) {
      const last = locker.history[locker.history.length - 1];
      if (!last.releasedAt) {
        last.releasedAt = new Date();
        last.releasedBy = req.user._id;
        last.notes = `Manual vacate by Security: ${reason}`;
      }
    }

    locker.status = 'vacant';
    locker.currentFoundItem = null;
    locker.assignedBy = null;
    locker.assignedAt = null;
    await locker.save();

    res.status(200).json({
      success: true,
      message: `Locker ${locker.lockerNumber} vacated successfully.`,
      locker
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLockers,
  getCustodyLocations,
  assignLocker,
  vacateLocker
};
