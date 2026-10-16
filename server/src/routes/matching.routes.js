/**
 * Matching Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  getItemMatches,
  getMyMatches,
  dismissMatch
} = require('../controllers/matching.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public / optional read for item matches
router.get('/item/:id', getItemMatches);

// Protected routes for current user
router.get('/my', protect, getMyMatches);
router.patch('/:id/dismiss', protect, dismissMatch);

module.exports = router;
