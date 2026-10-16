/**
 * Authentication and Role-Based Authorization Middleware
 * Campus Lost & Found Portal
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/user.model');

/**
 * Protect routes: verify JWT session token
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Check Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in with your university account.'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this session no longer exists.'
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by campus administration.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please sign in again.'
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Example usage: authorize('admin'), authorize('admin', 'security')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires ${roles.join(' or ')} privileges. Your role is '${req.user.role}'.`
      });
    }

    next();
  };
};

/**
 * Optional authentication middleware
 * Attaches user to req.user if valid token exists, otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);
    if (user && !user.isBlocked) {
      req.user = user;
    }
  } catch (err) {
    // Ignore error in optional auth
  }
  next();
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
