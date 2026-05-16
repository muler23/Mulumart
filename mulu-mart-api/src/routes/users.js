// routes/users.js
const express = require('express');
const {
  getUsers,
  getUser,
  getUserAdmin,
  createUser,
  updateUser,
  deleteUser,
  getUserAds,
  getUserFavorites,
  getUserReviews,
  userPhotoUpload,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const User = require('../models/User');

const router = express.Router();

// Public route for getting user profile
router
  .route('/:id')
  .get(getUser);

// Protected route for user stats (any authenticated user)
router
  .route('/stats')
  .get(protect, getUserStats)

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(User, 'reviews favorites'), getUsers)
  .post(createUser);

router
  .route('/:id')
  .put(updateUser)
  .delete(deleteUser);

router
  .route('/:id/ads')
  .get(getUserAds);

router
  .route('/:id/favorites')
  .get(getUserFavorites);

router
  .route('/:id/reviews')
  .get(getUserReviews);

router
  .route('/photo')
  .put(userPhotoUpload);

module.exports = router;