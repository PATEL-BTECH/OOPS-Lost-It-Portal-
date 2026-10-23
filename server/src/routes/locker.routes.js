/**
 * Physical Locker Routes
 * Campus Lost & Found Portal
 * Module Lead: Neerja (Security Desk & Physical Custody)
 */
const express = require('express');
const {
  getLockers,
  getCustodyLocations,
  assignLocker,
  vacateLocker
} = require('../controllers/locker.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Custody locations can be queried by authenticated users
router.get('/custody-locations', protect, getCustodyLocations);

// View all lockers - security, admin, and authenticated staff
router.get('/', protect, getLockers);

// Assign an item to a locker (Security desk and Admin only)
router.post('/assign', protect, authorize('security', 'admin'), assignLocker);

// Vacate a locker with documented audit reason (Security desk and Admin only)
router.post('/:id/vacate', protect, authorize('security', 'admin'), vacateLocker);

module.exports = router;
