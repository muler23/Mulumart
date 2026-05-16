const express = require('express');
const router = express.Router();
const {
  createOrUpdateBusinessAccount,
  getBusinessAccount,
  subscribeToPlan,
  getBusinessAnalytics,
  uploadBusinessDocuments,
  verifyBusinessAccount,
  getAllBusinessAccounts,
  updateBusinessAnalytics,
  cancelSubscription,
  getExpiringSubscriptions,
  getBusinessStats,
  getBusinessAds
} = require('../controllers/businessController');
const { protect } = require('../middleware/auth');

// Protect all business routes
router.use(protect);

// @route   POST /api/v1/business/account
router.post('/account', createOrUpdateBusinessAccount);

// @route   GET /api/v1/business/account
router.get('/account', getBusinessAccount);

// @route   POST /api/v1/business/subscribe
router.post('/subscribe', subscribeToPlan);

// @route   GET /api/v1/business/analytics
router.get('/analytics', getBusinessAnalytics);

// @route   POST /api/v1/business/documents
router.post('/documents', uploadBusinessDocuments);

// @route   POST /api/v1/business/cancel-subscription
router.post('/cancel-subscription', cancelSubscription);

// Admin only routes
router.put('/:businessId/verify', verifyBusinessAccount);
router.get('/accounts', getAllBusinessAccounts);
router.put('/analytics', updateBusinessAnalytics);
router.get('/expiring-subscriptions', getExpiringSubscriptions);

// Dashboard routes
router.get('/stats', getBusinessStats);
router.get('/ads', getBusinessAds);

module.exports = router;
