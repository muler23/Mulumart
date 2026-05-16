// controllers/favoriteController.js
const Favorite = require('../models/Favorite');
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user's favorites
// @route   GET /api/v1/favorites
// @access  Private
exports.getFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'ad',
      select: 'title price condition images location'
    });

  res.status(200).json({
    success: true,
    count: favorites.length,
    data: favorites
  });
});

// @desc    Get user's favorites (alias for /my route)
// @route   GET /api/v1/favorites/my
// @access  Private
exports.getMyFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user.id })
    .populate({
      path: 'ad',
      select: 'title price condition images location'
    });

  res.status(200).json({
    success: true,
    count: favorites.length,
    data: favorites
  });
});

// @desc    Add to favorites
// @route   POST /api/v1/ads/:id/favorites
// @access  Private
exports.addFavorite = asyncHandler(async (req, res, next) => {
  console.log('addFavorite called with params:', req.params);
  console.log('addFavorite called with user:', req.user.id);
  
  const ad = await Ad.findById(req.params.id);
  console.log('Found ad:', ad);

  if (!ad) {
    console.log('Ad not found with ID:', req.params.id);
    return next(
      new ErrorResponse(`No ad with the id of ${req.params.id}`, 404)
    );
  }

  // Check if already favorited
  const existingFavorite = await Favorite.findOne({
    user: req.user.id,
    ad: req.params.id
  });
  console.log('Existing favorite:', existingFavorite);

  if (existingFavorite) {
    console.log('Ad already favorited by user');
    return next(
      new ErrorResponse('Ad already in favorites', 400)
    );
  }

  const favorite = await Favorite.create({
    user: req.user.id,
    ad: req.params.id
  });
  console.log('Created favorite:', favorite);

  res.status(201).json({
    success: true,
    data: favorite
  });
});

// @desc    Remove from favorites
// @route   DELETE /api/v1/favorites/:id
// @access  Private
exports.removeFavorite = asyncHandler(async (req, res, next) => {
  const favorite = await Favorite.findById(req.params.id);

  if (!favorite) {
    return next(
      new ErrorResponse(`No favorite with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is favorite owner
  if (favorite.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse('Not authorized to remove this favorite', 401)
    );
  }

  await favorite.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update favorite
// @route   PUT /api/v1/favorites/:id
// @access  Private
exports.updateFavorite = asyncHandler(async (req, res, next) => {
  let favorite = await Favorite.findById(req.params.id);

  if (!favorite) {
    return next(
      new ErrorResponse(`No favorite with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is favorite owner
  if (favorite.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse('Not authorized to update this favorite', 401)
    );
  }

  // Update fields
  favorite.notes = req.body.notes || favorite.notes;
  favorite.tags = req.body.tags || favorite.tags;

  await favorite.save();

  res.status(200).json({
    success: true,
    data: favorite
  });
});

// @desc    Get user's favorite tags
// @route   GET /api/v1/favorites/tags
// @access  Private
exports.getFavoriteTags = asyncHandler(async (req, res, next) => {
  const tags = await Favorite.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  res.status(200).json({
    success: true,
    count: tags.length,
    data: tags
  });
});

// @desc    Check if ad is favorited
// @route   GET /api/v1/favorites/check/:adId
// @access  Private
exports.checkFavorite = asyncHandler(async (req, res, next) => {
  const favorite = await Favorite.findOne({
    user: req.user.id,
    ad: req.params.adId
  });

  res.status(200).json({
    success: true,
    isFavorited: !!favorite,
    favoriteId: favorite?._id || null,
    data: favorite
  });
});

// @desc    Get favorite count for ad
// @route   GET /api/v1/favorites/count/:adId
// @access  Public
exports.getFavoriteCount = asyncHandler(async (req, res, next) => {
  const count = await Favorite.countDocuments({
    ad: req.params.adId
  });

  res.status(200).json({
    success: true,
    count
  });
});