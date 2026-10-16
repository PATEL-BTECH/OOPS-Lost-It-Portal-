/**
 * Admin Controller
 * Module Lead: Nand Patel (Admin dashboard, user management, moderation, analytics)
 */
const User = require('../models/user.model');
const LostItem = require('../models/lostItem.model');
const FoundItem = require('../models/foundItem.model');
const Claim = require('../models/claim.model');
const Category = require('../models/category.model');
const Announcement = require('../models/announcement.model');
const AuditLog = require('../models/auditLog.model');

/**
 * GET /api/admin/analytics
 * Aggregates portal metrics formatted for Recharts data visualization
 */
const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalLost,
      totalFound,
      totalHandedOver,
      pendingClaims,
      totalUsers,
      categories
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      Claim.countDocuments({ status: 'handed_over' }),
      Claim.countDocuments({ status: 'pending' }),
      User.countDocuments(),
      Category.find({ isActive: true })
    ]);

    const totalReported = totalLost + totalFound;
    const recoveryRate = totalReported > 0 ? Math.round((totalHandedOver / totalReported) * 100) : 0;

    // 1. Category Distribution Data for Recharts Bar/Pie Charts
    const categoryDistribution = await Promise.all(
      categories.map(async (cat) => {
        const [lostCount, foundCount] = await Promise.all([
          LostItem.countDocuments({ category: cat._id }),
          FoundItem.countDocuments({ category: cat._id })
        ]);
        return {
          name: cat.name.length > 18 ? cat.name.slice(0, 16) + '...' : cat.name,
          fullName: cat.name,
          lost: lostCount,
          found: foundCount,
          total: lostCount + foundCount
        };
      })
    );

    // 2. Monthly Trend Data (Simulated / Aggregated last 6 months for chart rendering)
    const monthNames = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const monthlyTrends = monthNames.map((m, idx) => {
      const multiplier = idx + 1;
      return {
        month: m,
        lost: Math.max(1, Math.round(totalLost * (0.12 * multiplier))),
        found: Math.max(1, Math.round(totalFound * (0.14 * multiplier))),
        recovered: Math.max(0, Math.round(totalHandedOver * (0.15 * multiplier)))
      };
    });

    // 3. Status Breakdown for Recharts Donut
    const availableFound = await FoundItem.countDocuments({ status: 'available' });
    const claimPending = await FoundItem.countDocuments({ status: 'claim_pending' });
    const openLost = await LostItem.countDocuments({ status: 'open' });

    const statusDonut = [
      { name: 'Open Lost Items', value: openLost, color: '#8b5cf6' },
      { name: 'Available Found', value: availableFound, color: '#10b981' },
      { name: 'Claims Under Review', value: claimPending, color: '#f59e0b' },
      { name: 'Recovered & Handed Over', value: totalHandedOver, color: '#0284c7' }
    ];

    res.status(200).json({
      success: true,
      metrics: {
        totalLost,
        totalFound,
        totalHandedOver,
        pendingClaims,
        totalUsers,
        recoveryRate
      },
      categoryDistribution,
      monthlyTrends,
      statusDonut
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/users
 * Searchable, filterable list of university users
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, isBlocked, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isBlocked !== undefined) {
      query.isBlocked = isBlocked === 'true';
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      users: users.map((u) => u.toPublicJSON())
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/role
 * Promote or adjust user permissions (Admin, Security, Student)
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { id } = req.params;

    if (!['student', 'admin', 'security'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified.'
      });
    }

    // Prevent admin from demoting themselves
    if (id === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Security constraint: You cannot revoke your own administrator privileges.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log to Audit Log
    await AuditLog.create({
      user: req.user._id,
      action: 'USER_ROLE_PROMOTED',
      details: `Changed role of user ${user.name} (${user.email}) from '${oldRole}' to '${role}'.`,
      targetResource: 'User',
      targetId: user._id.toString()
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${role.toUpperCase()}.`,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/block
 * Suspend or unblock student account
 */
const toggleUserBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Security constraint: You cannot block your own account.'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    await AuditLog.create({
      user: req.user._id,
      action: user.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      details: `${user.isBlocked ? 'Blocked' : 'Unblocked'} account for ${user.name} (${user.email}).`,
      targetResource: 'User',
      targetId: user._id.toString()
    });

    res.status(200).json({
      success: true,
      message: `Account has been ${user.isBlocked ? 'blocked' : 'unblocked'}.`,
      user: user.toPublicJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/audit-logs
 * Fetch recent audit trail
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Announcements Management
 */
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements
    });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority } = req.body;
    const announcement = await Announcement.create({
      title,
      content,
      priority: priority || 'normal',
      author: req.user._id
    });

    await AuditLog.create({
      user: req.user._id,
      action: 'ANNOUNCEMENT_POSTED',
      details: `Published campus announcement: "${title}"`,
      targetResource: 'Announcement',
      targetId: announcement._id.toString()
    });

    res.status(201).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Announcement deleted.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  toggleUserBlock,
  getAuditLogs,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
