/**
 * Category Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const { getCategories, createCategory } = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorize('admin'), createCategory);

module.exports = router;
