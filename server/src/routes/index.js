/**
 * Central API Router Aggregator
 * Campus Lost & Found Portal
 */
const express = require('express');
const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const photoRoutes = require('./photos.routes');
const lostItemRoutes = require('./lostItem.routes');
const foundItemRoutes = require('./foundItem.routes');
const notificationRoutes = require('./notification.routes');
const matchingRoutes = require('./matching.routes');
const claimRoutes = require('./claim.routes');
const adminRoutes = require('./admin.routes');

const apiRouter = express.Router();

// Mount API routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/categories', categoryRoutes);
apiRouter.use('/photos', photoRoutes);
apiRouter.use('/lost-items', lostItemRoutes);
apiRouter.use('/found-items', foundItemRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/matches', matchingRoutes);
apiRouter.use('/claims', claimRoutes);
apiRouter.use('/admin', adminRoutes);

// Base route for API discovery
apiRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Campus Lost & Found Portal API',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/google, GET /api/auth/me',
      categories: 'GET /api/categories',
      photos: 'GET /api/photos/:id',
      lostItems: '/api/lost-items',
      foundItems: '/api/found-items',
      notifications: 'GET /api/notifications',
      matches: 'GET /api/matches/item/:id',
      claims: {
        submit: 'POST /api/claims',
        my: 'GET /api/claims/my',
        all: 'GET /api/claims (Admin/Security)',
        review: 'PATCH /api/claims/:id/review (Admin)',
        handover: 'POST /api/claims/:id/handover (Security)'
      },
      admin: '/api/admin (Phase 6)'
    }
  });
});

module.exports = apiRouter;
