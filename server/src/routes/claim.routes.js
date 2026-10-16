/**
 * Claim Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  createClaim,
  getMyClaims,
  getClaims,
  getClaimById,
  reviewClaim,
  recordHandover
} = require('../controllers/claim.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { singlePhotoUpload } = require('../middleware/upload.middleware');

const router = express.Router();

router.use(protect);

// Student claim endpoints
router.post('/', singlePhotoUpload('proofPhoto'), createClaim);
router.get('/my', getMyClaims);

// Privileged overview (Admin & Security)
router.get('/', authorize('admin', 'security'), getClaims);
router.get('/:id', getClaimById);

// Admin review workflow
router.patch('/:id/review', authorize('admin'), reviewClaim);

// Security Desk physical verification & handover
router.post('/:id/handover', authorize('security', 'admin'), recordHandover);

module.exports = router;
