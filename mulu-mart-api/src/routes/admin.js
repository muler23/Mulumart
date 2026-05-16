// routes/admin.js
const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAds,
  updateAdStatus,
  getReviews,
  updateReviewStatus,
  getDashboardStats,
  getAdvancedAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');
const Ad = require('../models/Ad');
const Review = require('../models/Review');

const router = express.Router();

// Protect all routes with JWT and admin role
router.use(protect);
router.use(authorize('admin'));

// User routes
router
  .route('/users')
  .get(getUsers)
  .post(createUser);

router
  .route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Ad routes
router
  .route('/ads')
  .get(getAds);

router
  .route('/ads/:id/status')
  .put(updateAdStatus);

// Review routes
router
  .route('/reviews')
  .get(
    advancedResults(Review, [
      { path: 'user', select: 'name' },
      { path: 'ad', select: 'title' }
    ]),
    getReviews
  );

router
  .route('/reviews/:id/status')
  .put(updateReviewStatus);

// Dashboard stats
router
  .route('/stats')
  .get(getDashboardStats);

// Analytics
router
  .route('/analytics')
  .get(getAdvancedAnalytics);

// Analytics detailed
router
  .route('/analytics/detailed')
  .get(getAdvancedAnalytics);

// Analytics export
router
  .route('/analytics/export')
  .get(getAdvancedAnalytics);

module.exports = router;