/**
 * Health Check Controller
 * Verifies server uptime, system metrics, and MongoDB Atlas connection state.
 */
const mongoose = require('mongoose');
const config = require('../config/env');

const dbStateMap = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

const getHealthStatus = (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusName = dbStateMap[dbState] || 'unknown';

  const healthData = {
    success: true,
    status: 'operational',
    service: 'Campus Lost & Found API',
    version: '1.0.0',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatusName,
      connected: dbState === 1,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };

  res.status(200).json(healthData);
};

module.exports = {
  getHealthStatus
};
