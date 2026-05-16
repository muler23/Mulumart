const Report = require('../models/Report');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fraudDetectionService = require('../services/fraudDetectionService');

// @desc    Create a report
// @route   POST /api/v1/reports
// @access  Private
exports.createReport = asyncHandler(async (req, res, next) => {
  const { reportedType, reportedId, reason, description, evidence } = req.body;

  // Validate required fields
  if (!reportedType || !reportedId || !reason || !description) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Check if user already reported this item
  const existingReport = await Report.findOne({
    reporterId: req.user.id,
    reportedType,
    reportedId,
    status: { $in: ['pending', 'under_review'] }
  });

  if (existingReport) {
    return next(new ErrorResponse('You have already reported this item', 400));
  }

  // Determine priority based on reason
  let priority = 'medium';
  if (['fraud', 'harassment', 'inappropriate_content'].includes(reason)) {
    priority = 'high';
  } else if (reason === 'spam') {
    priority = 'low';
  }

  // Create report
  const report = await Report.create({
    reporterId: req.user.id,
    reportedType,
    reportedId,
    reason,
    description,
    evidence: evidence || [],
    priority
  });

  // Run fraud detection if this is a high-priority report
  if (priority === 'high') {
    try {
      if (reportedType === 'user') {
        await fraudDetectionService.analyzeUserActivity(reportedId);
      } else if (reportedType === 'ad') {
        await fraudDetectionService.analyzeAd(reportedId);
      }
    } catch (error) {
      console.error('❌ Error running fraud detection:', error);
    }
  }

  res.status(201).json({
    success: true,
    data: report
  });
});

// @desc    Get all reports (admin only)
// @route   GET /api/v1/reports
// @access  Private/Admin
exports.getReports = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { page = 1, limit = 20, status, priority, assignedTo, reportedType } = req.query;

  let query = {};
  
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignedTo) query.assignedTo = assignedTo;
  if (reportedType) query.reportedType = reportedType;

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
// @route   PUT /api/v1/reports/:id
// @access  Private/Admin
exports.updateReport = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

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

// @desc    Get report statistics (admin only)
// @route   GET /api/v1/reports/statistics
// @access  Private/Admin
exports.getReportStatistics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { startDate, endDate } = req.query;
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const statistics = await Report.getReportStatistics(start, end);

  res.status(200).json({
    success: true,
    data: statistics
  });
});

// @desc    Get top reported items (admin only)
// @route   GET /api/v1/reports/top-reported
// @access  Private/Admin
exports.getTopReportedItems = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { limit = 10 } = req.query;

  const topReported = await Report.getTopReportedItems(parseInt(limit));

  res.status(200).json({
    success: true,
    data: topReported
  });
});
