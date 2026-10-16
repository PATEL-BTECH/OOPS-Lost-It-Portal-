/**
 * LostItem Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  createLostItem,
  getLostItems,
  getMyLostReports,
  getLostItemById,
  updateLostItem,
  deleteLostItem
} = require('../controllers/lostItem.controller');
const { protect } = require('../middleware/auth.middleware');
const { singlePhotoUpload } = require('../middleware/upload.middleware');

const router = express.Router();

// Public browse & search
router.get('/', getLostItems);

// Protected routes
router.get('/my', protect, getMyLostReports);
router.post('/', protect, singlePhotoUpload('photo'), createLostItem);
router.get('/:id', getLostItemById);
router.patch('/:id', protect, updateLostItem);
router.delete('/:id', protect, deleteLostItem);

module.exports = router;
