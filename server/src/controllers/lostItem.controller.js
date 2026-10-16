/**
 * LostItem Controller
 * Module Lead: Priyanshi (Lost items, search, filtering, item details)
 */
const LostItem = require('../models/lostItem.model');
const { uploadPhotoToGridFS, deletePhotoFromGridFS } = require('../services/photo.service');
const { matchLostItemAgainstFoundItems } = require('../services/matching.service');

/**
 * POST /api/lost-items
 * Report a new lost item with optional GridFS photo upload
 */
const createLostItem = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      brand,
      color,
      lastSeenLocation,
      dateLost,
      rewardOffered,
      contactPhone
    } = req.body;

    let photoId = null;

    // Handle photo upload to MongoDB GridFS if file provided
    if (req.file) {
      photoId = await uploadPhotoToGridFS(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
    }

    const lostItem = await LostItem.create({
      name,
      category,
      description,
      brand: brand || '',
      color: color || '',
      lastSeenLocation,
      dateLost: dateLost ? new Date(dateLost) : new Date(),
      photo: photoId,
      reportedBy: req.user._id,
      rewardOffered: rewardOffered || '',
      contactPhone: contactPhone || req.user.phone || ''
    });

    const populatedItem = await LostItem.findById(lostItem._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email profileImage');

    // Asynchronously trigger rule-based smart matching
    matchLostItemAgainstFoundItems(lostItem._id).catch((err) => {
      console.warn('[Matching Service Notice]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Lost item report submitted successfully.',
      item: populatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lost-items
 * Query lost items with search, filters, and pagination
 */
const getLostItems = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      color,
      brand,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    // Keyword search using MongoDB text index or regex
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { lastSeenLocation: { $regex: search, $options: 'i' } }
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

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const sortOptions = { [sortBy]: order === 'asc' ? 1 : -1 };

    const total = await LostItem.countDocuments(query);
    const items = await LostItem.find(query)
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
 * GET /api/lost-items/my
 * Get items reported by current logged-in user
 */
const getMyLostReports = async (req, res, next) => {
  try {
    const items = await LostItem.find({ reportedBy: req.user._id })
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
 * GET /api/lost-items/:id
 * Retrieve a specific lost item by ID
 */
const getLostItemById = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('category', 'name icon description')
      .populate('reportedBy', 'name email profileImage phone department');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item record not found.'
      });
    }

    res.status(200).json({
      success: true,
      item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/lost-items/:id
 * Update lost item status or details
 */
const updateLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found.'
      });
    }

    // Authorization: only reporter or admin can edit
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this report.'
      });
    }

    const allowedUpdates = ['name', 'description', 'brand', 'color', 'lastSeenLocation', 'status', 'rewardOffered'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    await item.save();

    const updated = await LostItem.findById(item._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Lost item updated successfully.',
      item: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/lost-items/:id
 * Delete report and cleanup associated GridFS photo
 */
const deleteLostItem = async (req, res, next) => {
  try {
    const item = await LostItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Lost item not found.'
      });
    }

    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot delete reports created by others.'
      });
    }

    // Delete photo from GridFS if one exists
    if (item.photo) {
      await deletePhotoFromGridFS(item.photo.toString());
    }

    await LostItem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Lost item report deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLostItem,
  getLostItems,
  getMyLostReports,
  getLostItemById,
  updateLostItem,
  deleteLostItem
};
