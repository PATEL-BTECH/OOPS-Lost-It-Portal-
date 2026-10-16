/**
 * Photo Routes
 * Campus Lost & Found Portal
 */
const express = require('express');
const { streamPhoto } = require('../controllers/photo.controller');

const router = express.Router();

// GET /api/photos/:id
router.get('/:id', streamPhoto);

module.exports = router;
