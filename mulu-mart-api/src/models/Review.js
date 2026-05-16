const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ad',
    required: [true, 'Review must be associated with an ad']
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewer']
  },
  reviewedUser: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must be for a user']
  },
  rating: {
    type: Number,
    required: [true, 'Review must have a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review must have a comment'],
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters']
  },
  helpful: {
    type: Number,
    default: 0
  },
  notHelpful: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  response: {
    content: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

reviewSchema.index({ ad: 1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ reviewedUser: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

reviewSchema.index({ ad: 1, reviewer: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'reviewer',
    select: 'name photo'
  }).populate({
    path: 'reviewedUser',
    select: 'name photo'
  }).populate({
    path: 'response.respondedBy',
    select: 'name photo'
  });
  next();
});

reviewSchema.methods.updateHelpfulness = async function(helpful) {
  if (helpful) {
    this.helpful += 1;
  } else {
    this.notHelpful += 1;
  }
  await this.save();
};

reviewSchema.methods.addResponse = async function(content, respondedBy) {
  this.response = {
    content,
    respondedAt: Date.now(),
    respondedBy
  };
  await this.save();
};

reviewSchema.statics.getUserReviews = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ reviewedUser: userId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getAdReviews = function(adId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  return this.find({ ad: adId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
};

reviewSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { reviewedUser: userId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  stats[0].ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });
  
  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
    ratingDistribution: distribution
  };
};

reviewSchema.post('save', async function() {
  const User = mongoose.model('User');
  const user = await User.findById(this.reviewedUser);
  if (user) {
    await user.updateRating();
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
