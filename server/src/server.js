/**
 * Server Entry Point
 * Campus Lost & Found Portal
 */
const http = require('http');
const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🔥 [CRITICAL] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// Initialize Server
const startServer = async () => {
  console.log('🚀 Initializing Campus Lost & Found Backend Services...');

  // Connect to Database
  await connectDB();

  const server = http.createServer(app);

  server.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🌐 Server Running on Port: ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
    console.log(`🩺 Health Endpoint: http://localhost:${config.port}/api/health`);
    console.log(`👥 Allowed Client Origin: ${config.clientUrl}`);
    console.log('====================================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('⚠️ [CRITICAL] Unhandled Promise Rejection:', err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
