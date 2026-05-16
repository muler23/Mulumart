const mongoose = require('mongoose');
const slugify = require('slugify');
const AppError = require('../utils/appError');

const adSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'An ad must have a title'],
      trim: true,
      maxlength: [100, 'An ad title must have less or equal than 100 characters'],
      minlength: [10, 'An ad title must have more or equal than 10 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'An ad must have a description'],
      trim: true,
      maxlength: [2000, 'Description cannot be longer than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'An ad must have a price'],
      min: [0, 'Price must be a positive number'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be a positive number'],
    },
    isPriceNegotiable: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
      required: [true, 'Please specify the condition of the item'],
      enum: {
        values: ['new', 'used', 'refurbished'],
        message: 'Condition is either: new, used, or refurbished',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'An ad must belong to a category'],
      set: function(value) {
        // Handle both ObjectId and string
        if (typeof value === 'string') {
          // Try to find category by name or slug
          return value; // Keep as string, will be converted in controller
        }
        return value;
      }
    },
    subcategory: {
      type: String,
      trim: true,
    },
    subSubCategory: {
      type: String,
      trim: true,
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please provide a city'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Please provide a country'],
        trim: true,
        default: 'Ethiopia',
      },
    },
    address: {
      type: String,
      trim: true,
    },
    // coordinates: {
//   // GeoJSON Point (optional)
//   type: {
//     type: String,
//     default: 'Point',
//     enum: ['Point'],
//   },
//   coordinates: [Number],
// },
    images: [
      {
        url: String,
        publicId: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false, // Make optional to prevent validation errors
    },
    contactInfo: {
      email: String,
      phone: String,
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Make optional to prevent validation errors
      },
      name: String
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'pending', 'rejected', 'expired', 'draft'],
      default: 'active',
    },
    views: {
      type: Number,
      default: 0,
    },
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
    expiresAt: {
      type: Date,
      default: function () {
        // Default to 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        return expiryDate;
      },
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    specifications: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better performance
adSchema.index({ title: 1 });
adSchema.index({ description: 1 });
adSchema.index({ category: 1 });
adSchema.index({ postedBy: 1 });
adSchema.index({ status: 1 });
adSchema.index({ createdAt: -1 });
adSchema.index({ isPromoted: 1 });
adSchema.index({ priorityScore: -1 });
adSchema.index({ expiresAt: 1 });
adSchema.index({ isPromoted: -1, priorityScore: -1, createdAt: -1 });

// Virtual populate
adSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'ad',
  localField: '_id',
});

adSchema.virtual('favorites', {
  ref: 'Favorite',
  foreignField: 'ad',
  localField: '_id',
});

// Document middleware: runs before .save() and .create() (temporarily disabled)
// adSchema.pre('save', function (next) {
//   this.slug = slugify(this.title, { lower: true });
//   next();
// });

// Query middleware (temporarily disabled)
// adSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'postedBy',
//     select: 'name email phone photo',
//   })
//     .populate('category')
//     .populate('location');
//   next();
// });

// Calculate priority score based on promotion tier
adSchema.methods.calculatePriorityScore = function () {
  if (!this.isPromoted || !this.promotionTier) {
    this.priorityScore = 0;
    return;
  }

  const tierWeights = {
    bronze: 1,
    silver: 2,
    gold: 3,
  };

  const timeRemaining = this.promotionExpiresAt - Date.now();
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  // Base score from tier
  const tierScore = tierWeights[this.promotionTier] || 0;
  
  // Time decay factor (higher for more recent promotions)
  const timeDecay = 1 - (1 / (daysRemaining + 1));
  
  // Calculate final priority score
  this.priorityScore = tierScore * (1 + timeDecay);
};

// Check if ad is expired
adSchema.methods.isExpired = function () {
  return this.expiresAt < Date.now();
};

// Check if promotion is active
adSchema.methods.isPromotionActive = function () {
  return this.isPromoted && this.promotionExpiresAt > Date.now();
};

// Static method to get featured ads
adSchema.statics.getFeatured = function () {
  return this.find({ featured: true, status: 'active' })
    .sort('-createdAt')
    .limit(10);
};

// Static method to get similar ads
adSchema.statics.getSimilar = function (categoryId, adId, limit = 4) {
  return this.find({
    _id: { $ne: adId },
    category: categoryId,
    status: 'active',
  })
    .sort('-isPromoted -createdAt')
    .limit(limit);
};

const Ad = mongoose.model('Ad', adSchema);

module.exports = Ad;
