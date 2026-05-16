const paymentService = require('../services/paymentService');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Initiate payment for promotion
// @route   POST /api/v1/payments/initiate
// @access  Private
exports.initiatePayment = asyncHandler(async (req, res, next) => {
  const { adId, promotionTier, method, accountNumber, returnUrl, cancelUrl } = req.body;

  // Validate required fields
  if (!adId || !promotionTier || !method) {
    return next(new ErrorResponse('Ad ID, promotion tier, and payment method are required', 400));
  }

  // Validate account number for all payment methods
  if (!accountNumber || accountNumber.trim() === '') {
    return next(new ErrorResponse('Account number is required', 400));
  }

  try {
    const result = await paymentService.initiatePayment({
      userId: req.user.id,
      adId,
      promotionTier,
      method,
      accountNumber: accountNumber.trim(),
      returnUrl: returnUrl || `${process.env.CLIENT_URL}/payment/success`,
      cancelUrl: cancelUrl || `${process.env.CLIENT_URL}/payment/cancel`
    });

    res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Verify payment webhook (Telebirr)
// @route   POST /api/v1/payments/webhook/telebirr
// @access  Public
exports.verifyTelebirrWebhook = asyncHandler(async (req, res, next) => {
  try {
    const signature = req.headers['x-telebirr-signature'];
    const payload = req.body;

    console.log('📱 Telebirr webhook received:', payload);

    const result = await paymentService.verifyTelebirrWebhook(payload, signature);

    if (result.success) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Webhook processing failed' 
    });
  }
});

// @desc    Get payment history for user
// @route   GET /api/v1/payments/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const result = await paymentService.getUserPaymentHistory(
      req.user.id,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: result.payments,
      pagination: result.pagination
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get payment analytics (admin)
// @route   GET /api/v1/payments/analytics
// @access  Private (Admin only)
exports.getPaymentAnalytics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { startDate, endDate } = req.query;

  try {
    const analytics = await paymentService.getPaymentAnalytics(
      startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate) : new Date()
    );

    res.status(200).json({
      success: true,
      data: analytics
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Process refund
// @route   POST /api/v1/payments/refund
// @access  Private (Admin only)
exports.processRefund = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Admin access required', 401));
  }

  const { transactionId, reason } = req.body;

  if (!transactionId || !reason) {
    return next(new ErrorResponse('Transaction ID and reason are required', 400));
  }

  try {
    const result = await paymentService.processRefund(transactionId, reason);

    res.status(200).json({
      success: true,
      message: result.message
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Check expired promotions (cron job)
// @route   POST /api/v1/payments/check-expired
// @access  Private (System only)
exports.checkExpiredPromotions = asyncHandler(async (req, res, next) => {
  try {
    const expiredCount = await paymentService.checkExpiredPromotions();

    res.status(200).json({
      success: true,
      data: {
        expiredCount,
        message: `Checked and expired ${expiredCount} promotions`
      }
    });

  } catch (error) {
    next(error);
  }
});

// @desc    Get promotion pricing
// @route   GET /api/v1/payments/pricing
// @access  Public
exports.getPromotionPricing = asyncHandler(async (req, res, next) => {
  try {
    const pricing = {
      bronze: {
        amount: 50,
        duration: 7,
        description: 'Bronze promotion - 7 days',
        features: ['Basic visibility boost', 'Priority placement in bronze tier']
      },
      silver: {
        amount: 120,
        duration: 14,
        description: 'Silver promotion - 14 days',
        features: ['Enhanced visibility', 'Top placement in silver tier', 'Analytics']
      },
      gold: {
        amount: 250,
        duration: 30,
        description: 'Gold promotion - 30 days',
        features: ['Maximum visibility', 'Premium placement', 'Advanced analytics', 'Support badge']
      }
    };

    res.status(200).json({
      success: true,
      data: pricing
    });

  } catch (error) {
    next(error);
  }
});
