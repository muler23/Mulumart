const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot be more than 500 characters'],
    },
    tags: [{
      type: String,
      trim: true,
      maxlength: [20, 'Tag cannot be more than 20 characters'],
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate favorites
FavoriteSchema.index({ user: 1, ad: 1 }, { unique: true });

// Static method to get user's favorites with pagination
FavoriteSchema.statics.getUserFavorites = async function (userId, page = 1, limit = 10, tag = null) {
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  
  // Filter by tag if provided
  if (tag) {
    query.tags = tag;
  }
  
  const favorites = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: 'ad',
      populate: {
        path: 'user',
        select: 'name rating reviewCount',
      },
    });
    
  const total = await this.countDocuments(query);
  
  return {
    favorites,
    page,
    pages: Math.ceil(total / limit),
    total,
  };
};

// Pre-save hook to ensure the ad exists and is active
FavoriteSchema.pre('save', async function (next) {
  const ad = await mongoose.model('Ad').findOne({
    _id: this.ad,
    isActive: true,
    isApproved: true,
  });
  
  if (!ad) {
    const error = new Error('The specified ad is not available');
    error.statusCode = 400;
    return next(error);
  }
  
  next();
});

// Method to get all unique tags for a user's favorites
FavoriteSchema.statics.getUserTags = async function (userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, name: '$_id', count: 1 } },
  ]);
};

// Post-save hook to update ad's favorite count
FavoriteSchema.post('save', async function () {
  await mongoose.model('Ad').findByIdAndUpdate(this.ad, {
    $inc: { favoriteCount: 1 },
  });
});

// Post-remove hook to update ad's favorite count
FavoriteSchema.post('remove', async function () {
  await mongoose.model('Ad').findByIdAndUpdate(this.ad, {
    $inc: { favoriteCount: -1 },
  });
});

// Populate ad details when querying
FavoriteSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'ad',
    select: 'title price condition images location createdAt',
    populate: {
      path: 'user',
      select: 'name rating',
    },
  });
  next();
});

module.exports = mongoose.model('Favorite', FavoriteSchema);
