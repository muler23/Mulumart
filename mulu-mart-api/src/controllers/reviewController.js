// controllers/reviewController.js
const Review = require('../models/Review');
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/ads/:adId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.adId) {
    const reviews = await Review.find({ ad: req.params.adId })
      .populate({
        path: 'user',
        select: 'name avatar'
      });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'ad',
    select: 'title'
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Add review
// @route   POST /api/v1/ads/:adId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
  // Add user and ad to req.body
  req.body.user = req.user.id;
  req.body.ad = req.params.adId;

  const ad = await Ad.findById(req.params.adId);

  if (!ad) {
    return next(
      new ErrorResponse(`No ad with the id of ${req.params.adId}`, 404)
    );
  }

  // Make sure user is not the ad owner
  if (ad.user.toString() === req.user.id) {
    return next(
      new ErrorResponse(`You cannot review your own ad`, 400)
    );
  }

  // Check if user has already reviewed the ad
  const existingReview = await Review.findOne({
    ad: req.params.adId,
    user: req.user.id
  });

  if (existingReview) {
    return next(
      new ErrorResponse(`User has already reviewed this ad`, 400)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Respond to review
// @route   PUT /api/v1/reviews/:id/respond
// @access  Private
exports.respondToReview = asyncHandler(async (req, res, next) => {
  const { comment } = req.body;

  if (!comment) {
    return next(new ErrorResponse(`Please provide a response`, 400));
  }

  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Get the ad to check ownership
  const ad = await Ad.findById(review.ad);

  // Make sure user is the ad owner
  if (ad.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to respond to this review`, 401)
    );
  }

  // Check if there's already a response
  if (review.response) {
    return next(
      new ErrorResponse(`You have already responded to this review`, 400)
    );
  }

  review.response = {
    comment,
    respondedAt: Date.now()
  };

  await review.save();

  res.status(200).json({
    success: true,
    data: review
  });
});