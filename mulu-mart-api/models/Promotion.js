const mongoose = require('mongoose');

const PromotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a promotion name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    tier: {
      type: String,
      required: [true, 'Please select a promotion tier'],
      enum: ['bronze', 'silver', 'gold'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Please add promotion duration in days'],
      min: [1, 'Duration must be at least 1 day'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be a positive number'],
    },
    features: [{
      type: String,
      required: [true, 'Please add at least one feature'],
    }],
    priority: {
      type: Number,
      required: [true, 'Please add a priority number'],
      min: [1, 'Priority must be at least 1'],
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxUses: {
      type: Number,
      default: null,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to ensure tier is lowercase
PromotionSchema.pre('save', function (next) {
  this.tier = this.tier.toLowerCase();
  next();
});

// Static method to get active promotions
PromotionSchema.statics.getActivePromotions = async function () {
  return this.find({ isActive: true })
    .sort('priority')
    .select('-__v -createdAt -updatedAt');
};

// Static method to get promotion by tier
PromotionSchema.statics.getByTier = async function (tier) {
  return this.findOne({ 
    tier: tier.toLowerCase(),
    isActive: true 
  });
};

// Method to check if promotion can be used
PromotionSchema.methods.canUse = function () {
  if (!this.isActive) return false;
  if (this.maxUses === null) return true;
  return this.currentUses < this.maxUses;
};

// Method to increment usage
PromotionSchema.methods.incrementUsage = async function () {
  if (this.maxUses !== null) {
    if (this.currentUses >= this.maxUses) {
      const error = new Error('Promotion usage limit reached');
      error.statusCode = 400;
      throw error;
    }
    this.currentUses += 1;
    await this.save();
  }
};

// Virtual for available uses
PromotionSchema.virtual('availableUses').get(function () {
  if (this.maxUses === null) return 'Unlimited';
  return this.maxUses - this.currentUses;
});

// Index for faster querying
PromotionSchema.index({ tier: 1, isActive: 1 });
PromotionSchema.index({ priority: 1 });

module.exports = mongoose.model('Promotion', PromotionSchema);
