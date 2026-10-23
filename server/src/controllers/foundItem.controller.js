/**
 * FoundItem Controller
 * Module Lead: Krisha (Found-item module, matching service, notifications)
 */
const FoundItem = require('../models/foundItem.model');
const { uploadPhotoToGridFS, deletePhotoFromGridFS } = require('../services/photo.service');
const { matchFoundItemAgainstLostItems } = require('../services/matching.service');

/**
 * POST /api/found-items
 * Report a found item with optional photo upload and private verification details
 */
const createFoundItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      brand,
      color,
      locationFound,
      dateFound,
      handedToSecurity,
      storageLocation,
      verificationDetails
    } = req.body;

    let photoId = null;

    if (req.file) {
      photoId = await uploadPhotoToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const isSecurityHanded = handedToSecurity === 'true' || handedToSecurity === true;

    const foundItem = await FoundItem.create({
      name,
      category,
      description,
      brand: brand || '',
      color: color || '',
      locationFound,
      dateFound: dateFound ? new Date(dateFound) : new Date(),
      photo: photoId,
      handedToSecurity: isSecurityHanded,
      custodyLocation: req.body.custodyLocation || 'MAIN_POST',
      storageLocation: storageLocation || (isSecurityHanded ? 'Handed to Main Campus Security' : 'With Finder (Pending Handover)'),
      verificationDetails: verificationDetails || '',
      reportedBy: req.user._id,
      status: 'available'
    });

    const populatedItem = await FoundItem.findById(foundItem._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email profileImage');

    // Asynchronously trigger rule-based smart matching
    matchFoundItemAgainstLostItems(foundItem._id).catch((err) => {
      console.warn('[Matching Service Notice]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Found item successfully reported.',
      item: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/found-items
 * Query found items with search & filters.
 * Note: 'verificationDetails' is strictly excluded from public queries.
 */
const getFoundItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      color,
      brand,
      handedToSecurity,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { locationFound: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (color) {
      query.color = { $regex: color, $options: 'i' };
    }

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' };
    }

    if (handedToSecurity !== undefined) {
      query.handedToSecurity = handedToSecurity === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

    const total = await FoundItem.countDocuments(query);
    const items = await FoundItem.find(query)
      .select('-verificationDetails') // Never expose private verification answers in public search
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/found-items/my
 * Get items reported by current logged-in user
 */
const getMyFoundReports = async (req, res, next) => {
  try {
    const items = await FoundItem.find({ reportedBy: req.user._id })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/found-items/:id
 * Retrieve details for a found item.
 * Privacy check: verificationDetails is only visible to reporter, admin, or security staff.
 */
const getFoundItemById = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('category', 'name icon description')
      .populate('reportedBy', 'name email profileImage phone department')
      .populate('securityReceivedBy', 'name email role');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Found item record not found.'
      });
    }

    // Convert to object so we can conditionally sanitize verificationDetails
    const itemObj = item.toObject();

    const isPrivileged =
      req.user &&
      (req.user.role === 'admin' ||
        req.user.role === 'security' ||
        item.reportedBy._id.toString() === req.user._id.toString());

    if (!isPrivileged) {
      delete itemObj.verificationDetails;
    }

    res.status(200).json({
      success: true,
      item: itemObj
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/found-items/:id
 * Update found item details or custody status
 */
const updateFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found.'
      });
    }

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isSecurity = req.user.role === 'security';

    if (!isOwner && !isAdmin && !isSecurity) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges to update this found item.'
      });
    }

    const allowedUpdates = [
      'name',
      'description',
      'brand',
      'color',
      'locationFound',
      'status',
      'storageLocation',
      'handedToSecurity'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    if (isSecurity && req.body.handedToSecurity) {
      item.securityReceivedBy = req.user._id;
    }

    await item.save();

    const updated = await FoundItem.findById(item._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Found item updated successfully.',
      item: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/found-items/:id
 * Delete report and cleanup associated GridFS photo
 */
const deleteFoundItem = async (req, res, next) => {
  try {
    const item = await FoundItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Found item not found.'
      });
    }

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to delete this report.'
      });
    }

    if (item.photo) {
      await deletePhotoFromGridFS(item.photo.toString());
    }

    await FoundItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Found item report deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
  getMyFoundReports,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem
};
