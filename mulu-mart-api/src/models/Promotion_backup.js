const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  ad: {
    type: mongoose.Schema.ObjectId,
    ref: 'Ad',
    required: [true, 'Promotion must be associated with an ad']
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold'],
    required: [true, 'Promotion must have a tier']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'Promotion must have an end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number,
    required: [true, 'Promotion must have a price']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  features: {
    highlighted: { type: Boolean, default: false },
    topPlacement: { type: Boolean, default: false },
    badge: { type: Boolean, default: false },
    priority: { type: Number, default: 0 }
  },
  stats: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

promotionSchema.index({ ad: 1 });
promotionSchema.index({ tier: 1 });
promotionSchema.index({ endDate: 1 });
promotionSchema.index({ isActive: 1, endDate: 1 });

promotionSchema.methods.isExpired = function() {
  return this.endDate < Date.now();
};

promotionSchema.methods.getDaysRemaining = function() {
  const now = new Date();
  const diffTime = this.endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

promotionSchema.methods.getTierConfig = function() {
  const configs = {
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
  
  return configs[this.tier] || configs.bronze;
};

promotionSchema.pre('save', function(next) {
  if (this.isNew) {
    const tierConfigs = {
      bronze: { days: 7, price: 5, features: { highlighted: true, topPlacement: false, badge: true, priority: 1 } },
      silver: { days: 14, price: 10, features: { highlighted: true, topPlacement: true, badge: true, priority: 2 } },
      gold: { days: 30, price: 20, features: { highlighted: true, topPlacement: true, badge: true, priority: 3 } }
    };
    
    const config = tierConfigs[this.tier] || tierConfigs.bronze;
    
    // Set features if not already set
    if (!this.features) {
      this.features = config.features;
    }
    
    // Set endDate if not already set
    if (!this.endDate) {
      this.endDate = new Date(this.startDate);
      this.endDate.setDate(this.endDate.getDate() + config.days);
    }
    
    // Set price if not already set
    if (!this.price) {
      this.price = config.price;
    }
  }
  next();
});

promotionSchema.statics.getActivePromotions = function() {
  return this.find({
    isActive: true,
    endDate: { $gt: Date.now() }
  }).populate('ad');
};

promotionSchema.statics.getPromotionsByTier = function(tier) {
  return this.find({
    tier,
    isActive: true,
    endDate: { $gt: Date.now() }
  }).populate('ad');
};

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;
