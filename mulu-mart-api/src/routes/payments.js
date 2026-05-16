const express = require('express');
const router = express.Router();
const {
  initiatePayment,
  verifyTelebirrWebhook,
  getPaymentHistory,
  getPaymentAnalytics,
  processRefund,
  checkExpiredPromotions,
  getPromotionPricing
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/pricing', getPromotionPricing);
router.post('/webhook/telebirr', verifyTelebirrWebhook);

// Protected routes (require authentication)
router.use(protect);

// @route   POST /api/v1/payments/initiate
router.post('/initiate', initiatePayment);

// @route   GET /api/v1/payments/history
router.get('/history', getPaymentHistory);

// Admin only routes
router.post('/refund', processRefund);
router.post('/check-expired', checkExpiredPromotions);
router.get('/analytics', getPaymentAnalytics);

module.exports = router;
