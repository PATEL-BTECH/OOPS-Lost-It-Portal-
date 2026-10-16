/**
 * Express Application Configuration
 * Campus Lost & Found Portal
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const config = require('./config/env');
const apiRouter = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==========================================
// Middleware Pipeline
// ==========================================

// HTTP Request Logging
if (!config.isProduction) {
  app.use(morgan('dev'));
}

// Secure CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        config.clientUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1 || !config.isProduction) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not permitted by CORS policy.`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parsing for secure auth sessions
app.use(cookieParser(config.cookieSecret));

// ==========================================
// API Routes
// ==========================================
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    portal: 'Campus Lost & Found System',
    status: 'online',
    documentation: '/api',
    healthCheck: '/api/health'
  });
});

// ==========================================
// Centralized Error Handling Pipeline
// ==========================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
