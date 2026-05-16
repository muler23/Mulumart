const BusinessAccount = require('../models/BusinessAccount');
const Ad = require('../models/Ad');
const Payment = require('../models/Payment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create or update business account
// @route   POST /api/v1/business/account
// @access  Private
exports.createOrUpdateBusinessAccount = asyncHandler(async (req, res, next) => {
  const {
    businessName,
    businessType,
    businessAddress,
    businessPhone,
    businessEmail,
    businessWebsite,
    businessDescription,
    subscription,
    settings
  } = req.body;

  let businessAccount = await BusinessAccount.findOne({ userId: req.user.id });

  if (businessAccount) {
    // Update existing account
    businessAccount = await BusinessAccount.findOneAndUpdate(
      { userId: req.user.id },
      {
        businessName,
        businessType,
        businessAddress,
        businessPhone,
        businessEmail,
        businessWebsite,
        businessDescription,
        subscription: subscription || businessAccount.subscription,
        settings: settings || businessAccount.settings
      },
      { new: true, runValidators: true }
    );
  } else {
    // Create new business account
    businessAccount = await BusinessAccount.create({
      userId: req.user.id,
      businessName,
      businessType,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessDescription,
      subscription: {
        plan: subscription?.plan || 'monthly',
        status: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      },
      settings
    });
  }

  res.status(200).json({
    success: true,
    data: businessAccount
  });
});

// @desc    Get business account details
// @route   GET /api/v1/business/account
// @access  Private
exports.getBusinessAccount = asyncHandler(async (req, res, next) => {
  const businessAccount = await BusinessAccount.findOne({ userId: req.user.id })
    .populate('userId', 'name email photo');

  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  res.status(200).json({
    success: true,
    data: businessAccount
  });
});

// @desc    Subscribe to business plan
// @route   POST /api/v1/business/subscribe
// @access  Private
exports.subscribeToPlan = asyncHandler(async (req, res, next) => {
  const { plan, paymentMethod } = req.body;

  if (!['monthly', 'yearly'].includes(plan)) {
    return next(new ErrorResponse('Invalid plan selected', 400));
  }

  const businessAccount = await BusinessAccount.findOne({ userId: req.user.id });
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  // Calculate subscription cost
  const planPrices = {
    monthly: 500,  // 500 ETB per month
    yearly: 5000   // 5000 ETB per year (save 1000 ETB)
  };

  const amount = planPrices[plan];
  const duration = plan === 'monthly' ? 30 : 365;

  // Create payment record
  const payment = await Payment.create({
    transactionId: `BIZ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user.id,
    amount,
    method: paymentMethod,
    status: 'pending',
    promotionTier: 'business',
    duration
  });

  // Update subscription (will be activated after payment confirmation)
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);

  businessAccount.subscription = {
    plan,
    status: 'pending',
    startDate,
    endDate,
    autoRenew: false,
    lastPaymentDate: null,
    nextPaymentDate: endDate
  };

  await businessAccount.save();

  // In a real implementation, you would integrate with payment gateway here
  // For now, we'll simulate successful payment
  setTimeout(async () => {
    try {
      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save();

      businessAccount.subscription.status = 'active';
      businessAccount.subscription.lastPaymentDate = new Date();
      await businessAccount.save();

      console.log(`✅ Business subscription activated: ${plan} for user ${req.user.id}`);
    } catch (error) {
      console.error('❌ Error activating subscription:', error);
    }
  }, 2000);

  res.status(200).json({
    success: true,
    data: {
      payment,
      subscription: businessAccount.subscription
    }
  });
});

// @desc    Get business analytics
// @route   GET /api/v1/business/analytics
// @access  Private
exports.getBusinessAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  const businessAccount = await BusinessAccount.findOne({ userId: req.user.id });
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const analytics = await BusinessAccount.getBusinessAnalytics(
    businessAccount._id,
    start,
    end
  );

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Upload business documents
// @route   POST /api/v1/business/documents
// @access  Private
exports.uploadBusinessDocuments = asyncHandler(async (req, res, next) => {
  const { documentType, documentUrl } = req.body;

  if (!['license', 'id', 'tax', 'other'].includes(documentType)) {
    return next(new ErrorResponse('Invalid document type', 400));
  }

  const businessAccount = await BusinessAccount.findOne({ userId: req.user.id });
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  businessAccount.verification.documents.push({
    type: documentType,
    url: documentUrl,
    uploadedAt: new Date()
  });

  await businessAccount.save();

  res.status(200).json({
    success: true,
    data: businessAccount.verification.documents
  });
});

// @desc    Verify business account (admin only)
// @route   PUT /api/v1/business/:businessId/verify
// @access  Private (Admin only)
exports.verifyBusinessAccount = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { isVerified, notes } = req.body;

  const businessAccount = await BusinessAccount.findById(req.params.businessId);
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  businessAccount.verification.isVerified = isVerified;
  businessAccount.verification.verifiedAt = new Date();
  businessAccount.verification.verifiedBy = req.user.id;

  if (isVerified) {
    // Enable business features
    businessAccount.features.businessBadge = true;
    businessAccount.features.prioritySupport = true;
    businessAccount.features.advancedAnalytics = true;
  }

  await businessAccount.save();

  res.status(200).json({
    success: true,
    data: businessAccount
  });
});

// @desc    Get all business accounts (admin only)
// @route   GET /api/v1/business/accounts
// @access  Private (Admin only)
exports.getAllBusinessAccounts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { page = 1, limit = 20, status, verified } = req.query;

  let query = {};
  
  if (status) {
    query['subscription.status'] = status;
  }
  
  if (verified !== undefined) {
    query['verification.isVerified'] = verified === 'true';
  }

  const businessAccounts = await BusinessAccount.find(query)
    .populate('userId', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await BusinessAccount.countDocuments(query);

  res.status(200).json({
    success: true,
    data: businessAccounts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Update business analytics
// @route   PUT /api/v1/business/analytics
// @access  Private (System only)
exports.updateBusinessAnalytics = asyncHandler(async (req, res, next) => {
  const { userId, analyticsData } = req.body;

  const businessAccount = await BusinessAccount.findOne({ userId });
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  // Update analytics
  Object.assign(businessAccount.analytics, analyticsData);
  await businessAccount.save();

  res.status(200).json({
    success: true,
    data: businessAccount.analytics
  });
});

// @desc    Cancel business subscription
// @route   POST /api/v1/business/cancel-subscription
// @access  Private
exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const businessAccount = await BusinessAccount.findOne({ userId: req.user.id });
  if (!businessAccount) {
    return next(new ErrorResponse('Business account not found', 404));
  }

  businessAccount.subscription.status = 'cancelled';
  businessAccount.subscription.autoRenew = false;
  
  await businessAccount.save();

  res.status(200).json({
    success: true,
    data: businessAccount.subscription
  });
});

// @desc    Get expiring subscriptions (admin only)
// @route   GET /api/v1/business/expiring-subscriptions
// @access  Private (Admin only)
exports.getExpiringSubscriptions = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { days = 7 } = req.query;

  const expiringAccounts = await BusinessAccount.getExpiringSubscriptions(parseInt(days));

  res.status(200).json({
    success: true,
    data: expiringAccounts
  });
});

// @desc    Get business statistics for dashboard
// @route   GET /api/v1/business/stats
// @access  Private/Business
exports.getBusinessStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get business account info
  const businessAccount = await BusinessAccount.findOne({ userId });
  
  // Get total listings
  const totalListings = await Ad.countDocuments({ postedBy: userId });
  
  // Get total revenue (placeholder - would need payment integration)
  const totalRevenue = 0;
  
  // Get total views for business ads
  const adsViews = await Ad.aggregate([
    { $match: { postedBy: userId } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]);
  
  // Get average rating (placeholder - would need reviews integration)
  const averageRating = 0; // Return number instead of string
  
  // Calculate growth percentages (placeholder data)
  const listingsGrowth = 15;
  const revenueGrowth = 23;
  const viewsGrowth = 8;
  
  res.status(200).json({
    success: true,
    data: {
      totalListings,
      totalRevenue,
      totalViews: adsViews[0]?.totalViews || 0,
      averageRating,
      listingsGrowth,
      revenueGrowth,
      viewsGrowth,
      subscription: businessAccount?.subscription || {
        plan: 'free',
        status: 'inactive',
        listingsAllowed: 5,
        promotionsAllowed: 0,
        features: []
      }
    }
  });
});

// @desc    Get business ads for dashboard
// @route   GET /api/v1/business/ads
// @access  Private/Business
exports.getBusinessAds = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit, 10) || 10;
  
  const ads = await Ad.find({ postedBy: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('postedBy', 'name email')
    .populate('category', 'name');
  
  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});
