/**
 * Authentication Controller
 * Campus Lost & Found Portal
 */
const {
  verifyGoogleCredential,
  authenticateGoogleUser,
  generateAuthToken,
  setAuthCookie,
  clearAuthCookie
} = require('../services/auth.service');
const config = require('../config/env');
const User = require('../models/user.model');

/**
 * POST /api/auth/google
 * Verify Google ID token, enforce domain, establish session
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required'
      });
    }

    // 1. Verify credential signature, claims, and domain
    const googleProfile = await verifyGoogleCredential(credential);

    // 2. Find or register user in MongoDB
    const user = await authenticateGoogleUser(googleProfile);

    // 3. Issue application JWT and HttpOnly cookie
    const token = generateAuthToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: `Welcome, ${user.name}!`,
      user: user.toPublicJSON(),
      token // Provided for Bearer fallback if needed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Return currently authenticated user profile
 */
const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toPublicJSON()
  });
};

/**
 * POST /api/auth/logout
 * Terminate session & clear cookies
 */
const logout = async (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * POST /api/auth/dev-login (Development Lab Helper)
 * Enables evaluation and testing of student, admin, and security roles
 * without requiring Google Cloud credentials locally.
 */
const devLogin = async (req, res, next) => {
  if (config.isProduction) {
    return res.status(403).json({
      success: false,
      message: 'Developer login is disabled in production.'
    });
  }

  try {
    const { role = 'student', name, email } = req.body;
    const targetEmail = (email || `${role}@${config.universityEmailDomain || 'gsfcuniversity.ac.in'}`).toLowerCase();
    const targetName = name || (role === 'admin' ? 'Nand Patel (Admin)' : role === 'security' ? 'Campus Security Desk' : 'GSFC University Student');

    let user = await User.findOne({ email: targetEmail });

    if (!user) {
      user = await User.create({
        name: targetName,
        email: targetEmail,
        role: ['student', 'admin', 'security'].includes(role) ? role : 'student',
        emailVerified: true,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(targetName)}`
      });
    } else {
      // Ensure role matches requested dev role
      if (user.role !== role && ['student', 'admin', 'security'].includes(role)) {
        user.role = role;
        await user.save();
      }
    }

    const token = generateAuthToken(user);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: `[Dev Mode] Signed in as ${user.name} (${user.role})`,
      user: user.toPublicJSON(),
      token
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin,
  getCurrentUser,
  logout,
  devLogin
};
