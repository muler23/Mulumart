const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const AdSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    condition: {
      type: String,
      required: [true, 'Please select condition'],
      enum: ['new', 'used', 'refurbished'],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    images: [
      {
        url: String,
        public_id: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isNegotiable: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    // Promotion fields
    isPromoted: {
      type: Boolean,
      default: false,
    },
    promotionTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', null],
      default: null,
    },
    promotionExpiresAt: Date,
    priorityScore: {
      type: Number,
      default: 0,
    },
    // Auto-expire feature
    expiresAt: {
      type: Date,
      default: function() {
        // Default to 30 days from now
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create ad slug from the title
AdSchema.pre('save', function(next) {
  this.slug = this.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
  next();
});

// Calculate priority score based on promotion tier and recency
AdSchema.pre('save', function(next) {
  if (this.isPromoted && this.promotionTier) {
    let tierScore = 0;
    switch (this.promotionTier) {
      case 'gold':
        tierScore = 3;
        break;
      case 'silver':
        tierScore = 2;
        break;
      case 'bronze':
        tierScore = 1;
        break;
      default:
        tierScore = 0;
    }
    
    // Add weight based on recency (newer ads get higher score)
    const recencyScore = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24); // days since creation
    this.priorityScore = tierScore * 10 + (1 / (1 + recencyScore));
  } else {
    this.priorityScore = 0;
  }
  next();
});

// Indexes for better query performance
AdSchema.index({ title: 'text', description: 'text' });
AdSchema.index({ location: 1 });
AdSchema.index({ category: 1 });
AdSchema.index({ price: 1 });
AdSchema.index({ isPromoted: 1, priorityScore: -1 });
AdSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

// Virtual for reviews
AdSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'ad',
  justOne: false,
});

// Static method to get average rating
AdSchema.statics.getAverageRating = async function(adId) {
  const obj = await this.model('Review').aggregate([
    {
      $match: { ad: adId },
    },
    {
      $group: {
        _id: '$ad',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Ad').findByIdAndUpdate(adId, {
      averageRating: obj[0] ? obj[0].averageRating : 0,
      reviewCount: obj[0] ? obj[0].reviewCount : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save or delete of a review
AdSchema.post('save', function() {
  this.constructor.getAverageRating(this._id);
});

AdSchema.post('remove', function() {
  this.constructor.getAverageRating(this._id);
});

// Add pagination plugin
AdSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Ad', AdSchema);
