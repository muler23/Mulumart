// controllers/userController.js
const User = require('../models/User');
const Ad = require('../models/Ad');
const Message = require('../models/Message');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user (public)
// @route   GET /api/v1/users/:id
// @access  Public
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-email -password');

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get single user (admin only)
// @route   GET /api/v1/users/:id/admin
// @access  Private/Admin
exports.getUserAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user's ads
// @route   GET /api/v1/users/:id/ads
// @access  Private
exports.getUserAds = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`Not authorized to view this user's ads`, 403)
    );
  }

  const ads = await Ad.find({ postedBy: req.params.id });

  res.status(200).json({
    success: true,
    count: ads.length,
    data: ads
  });
});

// @desc    Get user's favorites
// @route   GET /api/v1/users/:id/favorites
// @access  Private
exports.getUserFavorites = asyncHandler(async (req, res, next) => {
  if (req.params.id !== req.user.id) {
    return next(
      new ErrorResponse(`Not authorized to view this user's favorites`, 403)
    );
  }

  const favorites = await Favorite.find({ user: req.params.id })
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

// @desc    Get user's reviews
// @route   GET /api/v1/users/:id/reviews
// @access  Public
exports.getUserReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ user: req.params.id })
    .populate({
      path: 'ad',
      select: 'title images'
    })
    .populate({
      path: 'seller',
      select: 'name'
    });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews
  });
});

// @desc    Upload user photo
// @route   PUT /api/v1/users/photo
// @access  Private
exports.userPhotoUpload = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${req.user._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/users/${file.name}`, async err => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await User.findByIdAndUpdate(req.user.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});

// @desc    Get user statistics for dashboard
// @route   GET /api/v1/users/stats
// @access  Private
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  
  // Get user's ads count
  const myAds = await Ad.countDocuments({ postedBy: userId });
  
  // Get user's favorites count
  const favorites = await Ad.countDocuments({ 
    'favorites.users': userId 
  });
  
  // Get unread messages count
  const unreadMessages = await Message.countDocuments({
    $or: [
      { sender: userId, receiverRead: false },
      { receiver: userId, senderRead: false }
    ]
  });
  
  // Get total views for user's ads
  const adsViews = await Ad.aggregate([
    { $match: { postedBy: userId } },
    { $group: { _id: null, totalViews: { $sum: '$views' } } }
  ]);
  
  // Get member since date
  const user = await User.findById(userId);
  const memberSince = user ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  
  // Get average rating (placeholder - would need reviews integration)
  const averageRating = 0; 
  
  res.status(200).json({
    success: true,
    data: {
      myAds,
      favorites,
      unreadMessages,
      totalViews: adsViews[0]?.totalViews || 0,
      profileViews: 0, // Would need profile view tracking
      memberSince,
      averageRating
    }
  });
});

// @desc    Get current user's ads for dashboard
// @route   GET /api/v1/ads/my-ads
// @access  Private
exports.getMyAds = asyncHandler(async (req, res, next) => {
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