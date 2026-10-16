/**
 * Environment Configuration and Validation
 * Campus Lost & Found Portal
 */
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env from the server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongoUri: process.env.MONGO_URI || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  universityEmailDomain: (process.env.UNIVERSITY_EMAIL_DOMAIN || '').trim().toLowerCase(),
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_fallback_do_not_use_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: process.env.COOKIE_SECRET || 'cookie_secret_fallback',
  googleClientId: process.env.GOOGLE_CLIENT_ID || ''
};

// Check for missing critical configs in production
if (config.isProduction && !config.mongoUri) {
  console.error('[CONFIG CRITICAL] MONGO_URI is missing in production environment!');
}

module.exports = config;
