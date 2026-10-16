/**
 * Notification Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
