/**
 * Admin Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  getAnalytics,
  getUsers,
  updateUserRole,
  toggleUserBlock,
  getAuditLogs,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public / shared read for announcements
router.get('/announcements', getAnnouncements);

// Protected Administrator endpoints
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/block', toggleUserBlock);
router.get('/audit-logs', getAuditLogs);

router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
