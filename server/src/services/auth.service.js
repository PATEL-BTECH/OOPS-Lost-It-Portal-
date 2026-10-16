/**
 * Authentication Service
 * Campus Lost & Found Portal
 */
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/user.model');

const client = new OAuth2Client(config.googleClientId);

/**
 * Verify Google ID Token and enforce university domain restriction
 */
const verifyGoogleCredential = async (idToken) => {
  if (!idToken) {
    const error = new Error('Google credential token is missing.');
    error.statusCode = 400;
    throw error;
  }

  // Verify token signature with Google's public certificates
  const ticket = await client.verifyIdToken({
    idToken,
    audience: config.googleClientId ? config.googleClientId : undefined
  });

  const payload = ticket.getPayload();
  if (!payload) {
    const error = new Error('Invalid Google credential payload.');
    error.statusCode = 401;
    throw error;
  }

  const { sub, email, email_verified, name, picture, hd } = payload;

  // Confirm that Google reports the email as verified
  if (!email_verified) {
    const error = new Error('Unverified Google email address. Please verify your Google account.');
    error.statusCode = 403;
    throw error;
  }

  // Enforce configured university domain restriction
  const requiredDomain = config.universityEmailDomain;
  if (requiredDomain) {
    const emailLower = (email || '').toLowerCase();
    const domainMatch = emailLower.endsWith(`@${requiredDomain}`);
    const hdMatch = hd && hd.toLowerCase() === requiredDomain;

    if (!domainMatch && !hdMatch) {
      const error = new Error(
        `Access denied: Personal and unauthorized email accounts are rejected. You must sign in using your official @${requiredDomain} university account.`
      );
      error.statusCode = 403;
      error.code = 'DOMAIN_UNAUTHORIZED';
      throw error;
    }
  }

  return {
    googleSub: sub,
    email: email.toLowerCase(),
    name: name || 'University Member',
    profileImage: picture || '',
    emailVerified: email_verified
  };
};

/**
 * Find or register user with default 'student' role
 */
const authenticateGoogleUser = async (googleProfile) => {
  let user = await User.findOne({ googleSub: googleProfile.googleSub });

  if (user) {
    // Check if account is blocked
    if (user.isBlocked) {
      const error = new Error('Your university portal account has been suspended. Please contact campus security/admin.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_BLOCKED';
      throw error;
    }

    // Refresh profile details if changed
    let updated = false;
    if (googleProfile.profileImage && user.profileImage !== googleProfile.profileImage) {
      user.profileImage = googleProfile.profileImage;
      updated = true;
    }
    if (googleProfile.name && user.name !== googleProfile.name) {
      user.name = googleProfile.name;
      updated = true;
    }
    if (updated) {
      await user.save();
    }
  } else {
    // Check if user with same email exists (safe identity linking)
    user = await User.findOne({ email: googleProfile.email });

    if (user) {
      if (user.isBlocked) {
        const error = new Error('Your university portal account has been suspended.');
        error.statusCode = 403;
        error.code = 'ACCOUNT_BLOCKED';
        throw error;
      }
      user.googleSub = googleProfile.googleSub;
      user.emailVerified = true;
      if (!user.profileImage && googleProfile.profileImage) {
        user.profileImage = googleProfile.profileImage;
      }
      await user.save();
    } else {
      // Safe new registration: ALWAYS default to student role
      user = await User.create({
        name: googleProfile.name,
        email: googleProfile.email,
        googleSub: googleProfile.googleSub,
        emailVerified: true,
        profileImage: googleProfile.profileImage,
        role: 'student', // Never grant elevated roles on registration
        isBlocked: false
      });
    }
  }

  return user;
};

/**
 * Generate application JWT token
 */
const generateAuthToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn
    }
  );
};

/**
 * Set secure HTTP-only cookie
 */
const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: config.isProduction, // HTTPS in production
    sameSite: config.isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Clear authentication cookie
 */
const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? 'none' : 'lax'
  });
};

module.exports = {
  verifyGoogleCredential,
  authenticateGoogleUser,
  generateAuthToken,
  setAuthCookie,
  clearAuthCookie
};
