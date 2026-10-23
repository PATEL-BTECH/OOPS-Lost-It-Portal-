/**
 * Claim Controller
 * Module Lead: Neerja (Claims, verification, security staff, storage, handover)
 * Admin Reviews: Nand Patel
 */
const Claim = require('../models/claim.model');
const FoundItem = require('../models/foundItem.model');
const Notification = require('../models/notification.model');
const Locker = require('../models/locker.model');
const { uploadPhotoToGridFS } = require('../services/photo.service');

/**
 * POST /api/claims
 * Submit an ownership claim for a found item with evidence and optional proof photo
 */
const createClaim = async (req, res, next) => {
  try {
    const { foundItemId, evidenceDescription, contactPhone } = req.body;

    if (!foundItemId || !evidenceDescription) {
      return res.status(400).json({
        success: false,
        message: 'Found item ID and evidence description are required.'
      });
    }

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: 'The requested found item does not exist.'
      });
    }

    // Guard: Claimant cannot be the same user who reported the item as found
    if (foundItem.reportedBy.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an ownership claim for an item you reported finding.'
      });
    }

    // Guard: Prevent duplicate active claims by same student on same item
    const existingClaim = await Claim.findOne({
      foundItem: foundItemId,
      claimant: req.user._id,
      status: { $in: ['pending', 'approved', 'handed_over'] }
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: `You already have an active claim (${existingClaim.status.toUpperCase()}) for this item.`
      });
    }

    // Handle optional proof photo upload (e.g. purchase receipt, old photo with item)
    let proofPhotoId = null;
    if (req.file) {
      proofPhotoId = await uploadPhotoToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimant: req.user._id,
      evidenceDescription,
      proofPhoto: proofPhotoId,
      contactPhone: contactPhone || req.user.phone || '',
      status: 'pending'
    });

    // Update found item status to indicate an active claim is under review
    if (foundItem.status === 'available') {
      foundItem.status = 'claim_pending';
      await foundItem.save();
    }

    // Notify finder that an ownership claim was submitted
    await Notification.create({
      user: foundItem.reportedBy,
      type: 'claim_status',
      title: 'New Ownership Claim Submitted',
      message: `A student submitted an ownership claim for "${foundItem.name}". The claim is awaiting administrative verification.`,
      link: `/items/found/${foundItem._id}`,
      relatedItem: foundItem._id
    });

    const populatedClaim = await Claim.findById(claim._id)
      .populate('foundItem', 'name category brand color locationFound photo')
      .populate('claimant', 'name email');

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Campus administration will review your evidence.',
      claim: populatedClaim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/claims/my
 * Get all claims submitted by the logged-in student
 */
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate({
        path: 'foundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate('reviewedBy', 'name role')
      .populate('handoverDetails.verifiedBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/claims
 * Admin / Security Staff query all claims with filter by status
 */
const getClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Claim.countDocuments(query);
    const claims = await Claim.find(query)
      .populate('claimant', 'name email phone studentId department')
      .populate({
        path: 'foundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation verificationDetails',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate('reviewedBy', 'name role')
      .populate('handoverDetails.verifiedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: claims.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      claims
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/claims/:id
 * Retrieve a specific claim with permissions check
 */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('claimant', 'name email phone studentId department')
      .populate({
        path: 'foundItem',
        select: 'name category brand color locationFound dateFound photo status storageLocation verificationDetails reportedBy',
        populate: { path: 'category', select: 'name icon' }
      })
      .populate('reviewedBy', 'name role')
      .populate('handoverDetails.verifiedBy', 'name role');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim record not found.'
      });
    }

    const isClaimant = claim.claimant._id.toString() === req.user._id.toString();
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'security';

    if (!isClaimant && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this claim.'
      });
    }

    res.status(200).json({
      success: true,
      claim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/claims/:id/review
 * Admin moderation: Approve or reject an ownership claim with a recorded justification
 */
const reviewClaim = async (req, res, next) => {
  try {
    const { status, decisionReason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'approved' or 'rejected'."
      });
    }

    if (!decisionReason || decisionReason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'A detailed justification reason (at least 5 characters) is required for audit logs.'
      });
    }

    const claim = await Claim.findById(req.params.id).populate('foundItem').populate('claimant');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.'
      });
    }

    if (claim.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Claim has already been ${claim.status}. Only pending claims can be reviewed.`
      });
    }

    claim.status = status;
    claim.reviewedBy = req.user._id;
    claim.decisionReason = decisionReason.trim();
    claim.decidedAt = new Date();
    await claim.save();

    const foundItem = await FoundItem.findById(claim.foundItem._id);

    if (status === 'approved') {
      // Reject any other pending claims for this item
      await Claim.updateMany(
        { foundItem: foundItem._id, _id: { $ne: claim._id }, status: 'pending' },
        {
          status: 'rejected',
          decisionReason: 'Another student submitted verified prior proof of ownership.',
          reviewedBy: req.user._id,
          decidedAt: new Date()
        }
      );

      foundItem.status = 'claim_pending';
      await foundItem.save();

      // Notify claimant of approval
      await Notification.create({
        user: claim.claimant._id,
        type: 'claim_status',
        title: 'Claim Approved! Visit Campus Security',
        message: `Your ownership claim for "${foundItem.name}" has been approved! Reason: "${decisionReason}". Please report to the Campus Security Desk with your Student ID card.`,
        link: `/claims/my`,
        relatedItem: foundItem._id
      });
    } else {
      // Check if there are other pending claims
      const remainingPending = await Claim.countDocuments({
        foundItem: foundItem._id,
        status: 'pending'
      });

      if (remainingPending === 0) {
        foundItem.status = 'available';
        await foundItem.save();
      }

      // Notify claimant of rejection
      await Notification.create({
        user: claim.claimant._id,
        type: 'claim_status',
        title: 'Claim Decision: Rejected',
        message: `Your claim for "${foundItem.name}" was not approved. Administrator feedback: "${decisionReason}".`,
        link: `/claims/my`,
        relatedItem: foundItem._id
      });
    }

    const updatedClaim = await Claim.findById(claim._id)
      .populate('claimant', 'name email')
      .populate('foundItem', 'name category photo status')
      .populate('reviewedBy', 'name role');

    res.status(200).json({
      success: true,
      message: `Claim successfully ${status}.`,
      claim: updatedClaim
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/claims/:id/handover
 * Security Staff Desk: In-person claimant identity verification and physical handover record
 */
const recordHandover = async (req, res, next) => {
  try {
    const { claimantIdProof, handoverNotes } = req.body;

    if (!claimantIdProof || claimantIdProof.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Claimant university ID proof number (e.g. Student ID or Govt ID) is mandatory."
      });
    }

    const claim = await Claim.findById(req.params.id)
      .populate('foundItem')
      .populate('claimant');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim record not found.'
      });
    }

    if (claim.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot perform handover for a claim with status '${claim.status}'. Only administrative approved claims can be released.`
      });
    }

    // Generate tamper-resistant digital receipt code
    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `REC-GSFC-${dateStamp}-${randomSuffix}`;

    claim.status = 'handed_over';
    claim.handoverDetails = {
      verifiedBy: req.user._id,
      claimantIdProof: claimantIdProof.trim(),
      handoverDate: new Date(),
      handoverNotes: handoverNotes || 'Claimant verified in person against university records. Physical item released.',
      digitalReceiptNumber: receiptNumber
    };
    await claim.save();

    // Mark found item status as permanently handed over / closed
    const foundItem = await FoundItem.findById(claim.foundItem._id);
    foundItem.status = 'handed_over';
    foundItem.securityReceivedBy = req.user._id;
    foundItem.storageLocation = `Handed over to ${claim.claimant.name} (Receipt: ${receiptNumber})`;
    await foundItem.save();

    // Release any physical storage locker assigned to this item
    const assignedLocker = await Locker.findOne({ currentFoundItem: foundItem._id });
    if (assignedLocker) {
      assignedLocker.status = 'vacant';
      assignedLocker.currentFoundItem = null;
      assignedLocker.assignedBy = null;
      assignedLocker.assignedAt = null;
      if (assignedLocker.history && assignedLocker.history.length > 0) {
        const lastHistory = assignedLocker.history[assignedLocker.history.length - 1];
        if (!lastHistory.releasedAt) {
          lastHistory.releasedAt = new Date();
          lastHistory.releasedBy = req.user._id;
          lastHistory.digitalReceiptNumber = receiptNumber;
          lastHistory.notes = `Released upon student handover to ${claim.claimant.name} (${receiptNumber})`;
        }
      }
      await assignedLocker.save();
    }

    // Notify claimant with digital receipt
    await Notification.create({
      user: claim.claimant._id,
      type: 'security_handover',
      title: 'Item Handover Complete (Receipt Issued)',
      message: `Your belonging "${foundItem.name}" was handed over by Campus Security. Digital Receipt #: ${receiptNumber}`,
      link: `/claims/my`,
      relatedItem: foundItem._id
    });

    const finishedClaim = await Claim.findById(claim._id)
      .populate('claimant', 'name email studentId')
      .populate('foundItem', 'name category photo status')
      .populate('reviewedBy', 'name role')
      .populate('handoverDetails.verifiedBy', 'name role');

    res.status(200).json({
      success: true,
      message: 'Item physical handover recorded and digital receipt issued.',
      receiptNumber,
      claim: finishedClaim
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  reviewClaim,
  recordHandover
};
