/**
 * Authentication Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const {
  googleLogin,
  getCurrentUser,
  getSessionInfo,
  requestRoleElevation,
  logout,
  devLogin
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public auth endpoints
router.post('/google', googleLogin);
router.post('/dev-login', devLogin);

// Protected auth endpoints
router.get('/me', protect, getCurrentUser);
router.get('/session', protect, getSessionInfo);
router.post('/request-role', protect, requestRoleElevation);
router.post('/logout', protect, logout);

module.exports = router;
