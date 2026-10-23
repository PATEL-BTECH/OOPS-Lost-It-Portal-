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
 * Verify Google ID token, enforce domain, validate requested role, establish session
 */
const googleLogin = async (req, res, next) => {
  try {
    const { credential, intendedRole } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential token is required'
      });
    }

    // 1. Verify credential signature, claims, and domain
    const googleProfile = await verifyGoogleCredential(credential);

    // 2. Find or register user in MongoDB (New users strictly default to 'student')
    const user = await authenticateGoogleUser(googleProfile);

    // 3. Enforce Role-Selection Gate (Section 7: Selecting a role must NEVER grant that role)
    if (intendedRole && intendedRole !== 'student') {
      if (user.role !== intendedRole) {
        return res.status(403).json({
          success: false,
          code: 'ROLE_MISMATCH',
          actualRole: user.role,
          message: `Access Denied: Your university account is assigned the '${user.role.toUpperCase()}' role. You cannot sign in as '${intendedRole.toUpperCase()}'. Please select your authorized role or request role elevation from an Administrator.`
        });
      }
    }

    // 4. Issue application JWT and HttpOnly cookie
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
 * GET /api/auth/session
 * Return safe session and identity diagnostics without exposing tokens or secrets
 */
const getSessionInfo = async (req, res) => {
  res.status(200).json({
    success: true,
    session: {
      userId: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      authorizedDomain: config.universityEmailDomain || 'gsfcuniversity.ac.in',
      authMethod: req.user.authMethod || 'google',
      sessionStatus: 'Active (Authenticated via HttpOnly Cookie)',
      lastLoginAt: req.user.lastLoginAt || req.user.updatedAt,
      accountCreatedAt: req.user.createdAt,
      serverTime: new Date().toISOString()
    }
  });
};

/**
 * POST /api/auth/request-role
 * Allow student to request role elevation for administrator review
 */
const requestRoleElevation = async (req, res, next) => {
  try {
    const { requestedRole, reason } = req.body;

    if (!['admin', 'security'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid requested role. You can only request elevation to Admin or Security.'
      });
    }

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid justification (minimum 10 characters).'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.roleRequest = {
      requestedRole,
      reason: reason.trim(),
      requestedAt: new Date(),
      status: 'pending'
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: `Your request for the ${requestedRole.toUpperCase()} role has been submitted for Administrator review.`,
      roleRequest: user.roleRequest
    });
  } catch (error) {
    next(error);
  }
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

/**
 * PATCH /api/auth/profile
 * Update student profile questions (name, phone, studentId, department)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, studentId, department } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (studentId !== undefined) user.studentId = studentId.trim();
    if (department !== undefined) user.department = department.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile details saved successfully.',
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  googleLogin,
  getCurrentUser,
  getSessionInfo,
  updateProfile,
  requestRoleElevation,
  logout,
  devLogin
};
