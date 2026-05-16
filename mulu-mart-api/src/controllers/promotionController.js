const Promotion = require('../models/Promotion');
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all promotions
// @route   GET /api/v1/promotions
// @access  Private (Admin only)
exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find()
      .populate('ad', 'title price images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single promotion
// @route   GET /api/v1/promotions/:id
// @access  Private
exports.getPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('ad', 'title price images postedBy')
      .populate('ad.postedBy', 'name email');

    if (!promotion) {
      return next(new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404));
    }

    // Check ownership or admin
    if (promotion.ad.postedBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to view this promotion', 401));
    }

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create promotion
// @route   POST /api/v1/promotions
// @access  Private
exports.createPromotion = async (req, res, next) => {
  try {
    const { adId, tier } = req.body;

    if (!['bronze', 'silver', 'gold'].includes(tier)) {
      return next(new ErrorResponse('Invalid promotion tier', 400));
    }

    const ad = await Ad.findById(adId);
    if (!ad) {
      return next(new ErrorResponse(`Ad not found with id of ${adId}`, 404));
    }

    // Check ownership
    if (ad.postedBy.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to promote this ad', 401));
    }

    // Check if ad already has active promotion
    const existingPromotion = await Promotion.findOne({
      ad: adId,
      isActive: true,
      endDate: { $gt: Date.now() }
    });

    if (existingPromotion) {
      return next(new ErrorResponse('Ad already has an active promotion', 400));
    }

    // Create promotion
    const tierConfig = {
      bronze: { days: 7, price: 5 },
      silver: { days: 14, price: 10 },
      gold: { days: 30, price: 20 }
    };
    
    const config = tierConfig[tier];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + config.days);
    
    const promotion = await Promotion.create({
      ad: adId,
      tier,
      price: config.price,
      endDate,
      paymentStatus: 'pending'
    });

    // Update ad
    ad.isPromoted = true;
    ad.promotionTier = tier;
    ad.promotionExpiresAt = promotion.endDate;
    ad.calculatePriorityScore();
    await ad.save();

    res.status(201).json({
      success: true,
      data: promotion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update promotion payment status
// @route   PUT /api/v1/promotions/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;

    if (!['pending', 'paid', 'failed', 'refunded'].includes(paymentStatus)) {
      return next(new ErrorResponse('Invalid payment status', 400));
    }

    let promotion = await Promotion.findById(req.params.id)
      .populate('ad', 'title postedBy');

    if (!promotion) {
      return next(new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404));
    }

    // Check ownership or admin
    if (promotion.ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this promotion', 401));
    }

    promotion.paymentStatus = paymentStatus;
    if (paymentId) {
      promotion.paymentId = paymentId;
    }

    // Activate promotion if paid
    if (paymentStatus === 'paid') {
      promotion.isActive = true;
    }

    await promotion.save();

    res.status(200).json({
      success: true,
      data: promotion
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel promotion
// @route   DELETE /api/v1/promotions/:id
// @access  Private
exports.cancelPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('ad', 'title postedBy');

    if (!promotion) {
      return next(new ErrorResponse(`Promotion not found with id of ${req.params.id}`, 404));
    }

    // Check ownership or admin
    if (promotion.ad.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to cancel this promotion', 401));
    }

    // Update ad
    const ad = await Ad.findById(promotion.ad._id);
    ad.isPromoted = false;
    ad.promotionTier = null;
    ad.promotionExpiresAt = null;
    ad.priorityScore = 0;
    await ad.save();

    await promotion.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get promotion tiers pricing
// @route   GET /api/v1/promotions/tiers
// @access  Public
exports.getPromotionTiers = async (req, res, next) => {
  try {
    const tiers = {
      bronze: {
        days: parseInt(process.env.PROMOTION_BRONZE_DAYS) || 7,
        price: 5,
        features: {
          highlighted: true,
          topPlacement: false,
          badge: true,
          priority: 1
        }
      },
      silver: {
        days: parseInt(process.env.PROMOTION_SILVER_DAYS) || 14,
        price: 10,
        features: {
          highlighted: true,
          topPlacement: true,
          badge: true,
          priority: 2
        }
      },
      gold: {
        days: parseInt(process.env.PROMOTION_GOLD_DAYS) || 30,
        price: 20,
        features: {
          highlighted: true,
          topPlacement: true,
          badge: true,
          priority: 3
        }
      }
    };

    res.status(200).json({
      success: true,
      data: tiers
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user's promotions
// @route   GET /api/v1/promotions/my
// @access  Private
exports.getMyPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find({
      'ad.postedBy': req.user.id
    })
      .populate('ad', 'title price images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get active promotions
// @route   GET /api/v1/promotions/active
// @access  Public
exports.getActivePromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.getActivePromotions();

    res.status(200).json({
      success: true,
      count: promotions.length,
      data: promotions
    });
  } catch (err) {
    next(err);
  }
};
