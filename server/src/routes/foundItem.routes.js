/**
 * FoundItem Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  createFoundItem,
  getFoundItems,
  getMyFoundReports,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem
} = require('../controllers/foundItem.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { singlePhotoUpload } = require('../middleware/upload.middleware');

const router = express.Router();

// Public browse & search
router.get('/', getFoundItems);

// Protected routes
router.get('/my', protect, getMyFoundReports);
router.post('/', protect, singlePhotoUpload('photo'), createFoundItem);
router.get('/:id', optionalAuth, getFoundItemById);
router.patch('/:id', protect, updateFoundItem);
router.delete('/:id', protect, deleteFoundItem);

module.exports = router;
