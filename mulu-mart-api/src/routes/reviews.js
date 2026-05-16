// routes/reviews.js
const express = require('express');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
  respondToReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Review = require('../models/Review');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Review, {
      path: 'user',
      select: 'name avatar'
    }),
    getReviews
  )
  .post(protect, authorize('user', 'business'), addReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router
  .route('/:id/respond')
  .put(protect, authorize('business'), respondToReview);

module.exports = router;