// controllers/adminController.js
const User = require('../models/User');
const Ad = require('../models/Ad');
const Review = require('../models/Review');
const Category = require('../models/Category');
const Report = require('../models/Report');
const Payment = require('../models/Payment');
const BusinessAccount = require('../models/BusinessAccount');
const Message = require('../models/Message');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fraudDetectionService = require('../services/fraudDetectionService');

// @desc    Get all users (admin only)
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || '-createdAt';
    const order = req.query.order || 'desc';
    
    // Build sort string
    const sortString = order === 'desc' ? `-${sort}` : sort;
    
    // Execute query with pagination
    const users = await User.find({})
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-password');
    
    const total = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: users
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    return next(new ErrorResponse('Server error while fetching users', 500));
  }
});

// @desc    Get single user (admin only)
// @route   GET /api/v1/admin/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user (admin only)
// @route   POST /api/v1/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user (admin only)
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user (admin only)
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all ads (admin only)
// @route   GET /api/v1/admin/ads
// @access  Private/Admin
exports.getAds = asyncHandler(async (req, res, next) => {
  try {
    console.log('🔍 getAds called with query:', req.query);
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    
    // Build sort string
    const sortString = order === 'desc' ? `-${sort}` : sort;
    
    console.log('🔍 Query params:', { page, limit, sort, order, sortString });
    
    // First try without population to see if basic query works
    const ads = await Ad.find({})
      .sort(sortString)
      .skip((page - 1) * limit)
      .limit(limit);
    
    console.log('🔍 Found ads without population:', ads.length);
    
    const total = await Ad.countDocuments();
    console.log('🔍 Total ads count:', total);
    
    res.status(200).json({
      success: true,
      count: ads.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: ads
    });
  } catch (error) {
    console.error('❌ Error in getAds:', error);
    return next(new ErrorResponse('Server error while fetching ads', 500));
  }
});

// @desc    Update ad status (admin only)
// @route   PUT /api/v1/admin/ads/:id/status
// @access  Private/Admin
exports.updateAdStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(
      new ErrorResponse('Status must be one of: pending, approved, rejected', 400)
    );
  }

  const ad = await Ad.findById(req.params.id);

  if (!ad) {
    return next(
      new ErrorResponse(`Ad not found with id of ${req.params.id}`, 404)
    );
  }

  ad.status = status;
  ad.approvedAt = status === 'approved' ? Date.now() : null;
  await ad.save();

  // TODO: Send email notification to user about ad status change

  res.status(200).json({
    success: true,
    data: ad
  });
});

// @desc    Get all reviews (admin only)
// @route   GET /api/v1/admin/reviews
// @access  Private/Admin
exports.getReviews = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Update review status (admin only)
// @route   PUT /api/v1/admin/reviews/:id/status
// @access  Private/Admin
exports.updateReviewStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return next(
      new ErrorResponse('Status must be one of: pending, approved, rejected', 400)
    );
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`Review not found with id of ${req.params.id}`, 404)
    );
  }

  review.status = status;
  await review.save();

  // Update user's rating if review is approved
  if (status === 'approved') {
    await User.calculateAverageRating(review.user);
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Get dashboard stats (admin only)
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = {};

  // Get total users
  stats.totalUsers = await User.countDocuments();
  stats.newUsers = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  });

  // Get total ads
  stats.totalAds = await Ad.countDocuments();
  stats.pendingAds = await Ad.countDocuments({ status: 'pending' });
  stats.activeAds = await Ad.countDocuments({ status: 'approved', isActive: true });
  stats.expiredAds = await Ad.countDocuments({ isActive: false });

  // Get total categories
  stats.totalCategories = await Category.countDocuments();

  // Get total reviews
  stats.totalReviews = await Review.countDocuments();
  stats.pendingReviews = await Review.countDocuments({ status: 'pending' });

  // Get recent users
  stats.recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name email role createdAt');

  // Get recent ads
  stats.recentAds = await Ad.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('postedBy', 'name email')
    .select('title price status createdAt');

  // Get ad statistics by category
  stats.adsByCategory = await Category.aggregate([
    {
      $lookup: {
        from: 'ads',
        localField: '_id',
        foreignField: 'category',
        as: 'ads'
      }
    },
    {
      $project: {
        name: 1,
        count: { $size: '$ads' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get user signups by month
  stats.userSignupsByMonth = await User.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 }
      }
    },
    {
      $addFields: {
        month: '$_id'
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { month: 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

// @desc    Get advanced dashboard analytics (admin only)
// @route   GET /api/v1/admin/analytics
// @access  Private/Admin
exports.getAdvancedAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const analytics = {};

  // Revenue analytics
  analytics.revenue = await Payment.getRevenueAnalytics(start, end);

  // User engagement metrics
  analytics.userEngagement = await Message.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        uniqueUsers: { $addToSet: '$sender' },
        avgMessagesPerUser: { $avg: 1 }
      }
    },
    {
      $addFields: {
        uniqueUserCount: { $size: '$uniqueUsers' }
      }
    }
  ]);

  // Ad performance metrics
  analytics.adPerformance = await Ad.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalAds: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalViews: { $sum: '$views' },
        promotedAds: { $sum: { $cond: ['$isPromoted', 1, 0] } }
      }
    }
  ]);

  // Business account metrics
  analytics.businessMetrics = await BusinessAccount.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$subscription.plan',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$analytics.monthlyRevenue' }
      }
    }
  ]);

  // Report statistics
  analytics.reports = await Report.getReportStatistics(start, end);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get reports management data (admin only)
// @route   GET /api/v1/admin/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, status, priority, assignedTo } = req.query;

  let query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;

  const reports = await Report.find(query)
    .populate('reporterId', 'name email')
    .populate('reportedId')
    .populate('assignedTo', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Report.countDocuments(query);

  res.status(200).json({
    success: true,
    data: reports,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update report status (admin only)
// @route   PUT /api/v1/admin/reports/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res, next) => {
  const { status, priority, assignedTo, resolution } = req.body;

  const report = await Report.findById(req.params.id);
  if (!report) {
    return next(new ErrorResponse('Report not found', 404));
  }

  // Update report
  if (status) report.status = status;
  if (priority) report.priority = priority;
  if (assignedTo) report.assignedTo = assignedTo;
  
  if (resolution && ['resolved', 'dismissed'].includes(status)) {
    report.resolution = {
      ...resolution,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };
  }

  await report.save();

  res.status(200).json({
    success: true,
    data: report
  });
});

// @desc    Ban or warn user (admin only)
// @route   POST /api/v1/admin/users/:id/action
// @access  Private/Admin
exports.takeUserAction = asyncHandler(async (req, res, next) => {
  const { action, reason, duration } = req.body;
  const userId = req.params.id;

  if (!['warn', 'suspend', 'ban', 'unban'].includes(action)) {
    return next(new ErrorResponse('Invalid action', 400));
  }

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent admin from banning themselves
  if (userId === req.user.id) {
    return next(new ErrorResponse('Cannot take action on yourself', 400));
  }

  switch (action) {
    case 'warn':
      user.warnings = user.warnings || [];
      user.warnings.push({
        reason,
        date: new Date(),
        issuedBy: req.user.id
      });
      break;

    case 'suspend':
      user.isSuspended = true;
      user.suspensionReason = reason;
      user.suspensionExpires = duration ? 
        new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : 
        null;
      break;

    case 'ban':
      user.isBanned = true;
      user.banReason = reason;
      user.bannedAt = new Date();
      user.bannedBy = req.user.id;
      break;

    case 'unban':
      user.isBanned = false;
      user.banReason = null;
      user.bannedAt = null;
      user.bannedBy = null;
      break;
  }

  await user.save();

  // Log the action
  console.log(`🔨 Admin ${req.user.name} ${action} user ${user.name}: ${reason}`);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Run fraud detection scan (admin only)
// @route   POST /api/v1/admin/fraud-scan
// @access  Private/Admin
exports.runFraudScan = asyncHandler(async (req, res, next) => {
  const results = await fraudDetectionService.runFraudDetectionScan();

  res.status(200).json({
    success: true,
    data: results
  });
});

// @desc    Get system health metrics (admin only)
// @route   GET /api/v1/admin/system-health
// @access  Private/Admin
exports.getSystemHealth = asyncHandler(async (req, res, next) => {
  const health = {
    database: {
      status: 'connected',
      collections: {
        users: await User.countDocuments(),
        ads: await Ad.countDocuments(),
        messages: await Message.countDocuments(),
        reports: await Report.countDocuments(),
        payments: await Payment.countDocuments(),
        businesses: await BusinessAccount.countDocuments()
      }
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform
    },
    performance: {
      avgResponseTime: 150, // This would be calculated from actual metrics
      requestsPerMinute: 45,
      errorRate: 0.02
    },
    security: {
      activeReports: await Report.countDocuments({ status: 'pending' }),
      highRiskUsers: 0, // Would be calculated from fraud detection
      recentBans: await User.countDocuments({ 
        bannedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      })
    }
  };

  res.status(200).json({
    success: true,
    data: health
  });
});

// @desc    Manage categories (admin only)
// @route   POST /api/v1/admin/categories
// @route   PUT /api/v1/admin/categories/:id
// @route   DELETE /api/v1/admin/categories/:id
// @access  Private/Admin
exports.manageCategories = asyncHandler(async (req, res, next) => {
  const { name, description, icon, isActive } = req.body;
  const categoryId = req.params.id;

  let category;

  if (req.method === 'POST') {
    // Create new category
    category = await Category.create({
      name,
      description,
      icon,
      isActive: isActive !== false
    });
  } else if (req.method === 'PUT') {
    // Update existing category
    category = await Category.findByIdAndUpdate(
      categoryId,
      { name, description, icon, isActive },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }
  } else if (req.method === 'DELETE') {
    // Check if category has ads
    const adCount = await Ad.countDocuments({ category: categoryId });
    if (adCount > 0) {
      return next(new ErrorResponse('Cannot delete category with existing ads', 400));
    }

    category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }
  }

  res.status(req.method === 'POST' ? 201 : 200).json({
    success: true,
    data: category
  });
});