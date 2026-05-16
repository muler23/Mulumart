const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please add a rating between 1 and 5'],
    },
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
    response: {
      comment: String,
      respondedAt: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent user from submitting more than one review per ad
ReviewSchema.index({ ad: 1, user: 1 }, { unique: true });

// Static method to get average rating and save
ReviewSchema.statics.getAverageRating = async function (sellerId) {
  const obj = await this.aggregate([
    {
      $match: { 
        seller: sellerId,
        status: 'approved' 
      },
    },
    {
      $group: {
        _id: '$seller',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
        recommendedCount: {
          $sum: { $cond: [{ $eq: ['$isRecommended', true] }, 1, 0] },
        },
      },
    },
  ]);

  try {
    await this.model('User').findByIdAndUpdate(sellerId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      reviewCount: obj[0] ? obj[0].reviewCount : 0,
      recommendedRate: obj[0] 
        ? (obj[0].recommendedCount / obj[0].reviewCount) * 100 
        : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.seller);
  // Also update the ad's average rating
  this.model('Ad').getAverageRating(this.ad);
});

// Call getAverageRating after remove
ReviewSchema.post('remove', function () {
  this.constructor.getAverageRating(this.seller);
  // Also update the ad's average rating
  this.model('Ad').getAverageRating(this.ad);
});

// Populate user and ad information when querying
ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name profileImage',
  }).populate({
    path: 'ad',
    select: 'title images',
  });
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
