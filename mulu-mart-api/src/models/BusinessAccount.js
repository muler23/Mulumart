const mongoose = require('mongoose');

const businessAccountSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  businessName: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Business name cannot exceed 100 characters']
  },
  businessType: { 
    type: String, 
    enum: ['individual', 'registered', 'corporate'], 
    required: true,
    default: 'individual'
  },
  businessLicense: {
    number: String,
    issuedDate: Date,
    expiryDate: Date,
    documentUrl: String
  },
  businessAddress: {
    street: String,
    city: String,
    region: String,
    postalCode: String,
    country: { type: String, default: 'Ethiopia' }
  },
  businessPhone: {
    type: String,
    required: true
  },
  businessEmail: {
    type: String,
    lowercase: true,
    trim: true
  },
  businessWebsite: String,
  businessDescription: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  logo: String,
  subscription: {
    plan: { 
      type: String, 
      enum: ['monthly', 'yearly'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['active', 'expired', 'cancelled', 'trial'], 
      default: 'trial' 
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    autoRenew: { type: Boolean, default: false },
    lastPaymentDate: Date,
    nextPaymentDate: Date
  },
  features: {
    unlimitedAds: { type: Boolean, default: true },
    businessBadge: { type: Boolean, default: true },
    analytics: { type: Boolean, default: true },
    storefront: { type: Boolean, default: true },
    prioritySupport: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    bulkUpload: { type: Boolean, default: false }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: [{
      type: { type: String, enum: ['license', 'id', 'tax', 'other'] },
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }]
  },
  analytics: {
    totalViews: { type: Number, default: 0 },
    totalClicks: { type: Number, default: 0 },
    totalChats: { type: Number, default: 0 },
    totalAds: { type: Number, default: 0 },
    activePromotions: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }, // in minutes
    monthlyRevenue: { type: Number, default: 0 }
  },
  settings: {
    autoApproveAds: { type: Boolean, default: false },
    enableChatNotifications: { type: Boolean, default: true },
    enableEmailNotifications: { type: Boolean, default: true },
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String }
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
businessAccountSchema.index({ 'subscription.status': 1 });
businessAccountSchema.index({ 'verification.isVerified': 1 });
businessAccountSchema.index({ businessType: 1 });

// Virtual for checking if subscription is active
businessAccountSchema.virtual('isSubscriptionActive').get(function() {
  if (!this.subscription.endDate) return false;
  return new Date() <= this.subscription.endDate && this.subscription.status === 'active';
});

// Virtual for days until subscription expires
businessAccountSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.subscription.endDate) return 0;
  const diffTime = this.subscription.endDate - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get business analytics
businessAccountSchema.statics.getBusinessAnalytics = async function (businessId, startDate, endDate) {
  const Ad = mongoose.model('Ad');
  const Message = mongoose.model('Message');
  const Payment = mongoose.model('Payment');
  
  const business = await this.findById(businessId).populate('userId');
  
  // Get ad performance
  const adStats = await Ad.aggregate([
    { $match: { postedBy: business.userId, createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        totalAds: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalChats: { $sum: '$chats' },
        avgPrice: { $avg: '$price' },
        promotedAds: {
          $sum: { $cond: ['$isPromoted', 1, 0] }
        }
      }
    }
  ]);

  // Get payment history
  const paymentStats = await Payment.aggregate([
    { 
      $match: { 
        userId: business.userId, 
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      } 
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' },
        promotionCount: { $sum: 1 }
      }
    }
  ]);

  // Get chat response time
  const messageStats = await Message.aggregate([
    {
      $match: {
        sender: business.userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $lookup: {
        from: 'messages',
        let: { senderId: '$sender', adId: '$ad' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$recipient', '$$senderId'] },
                  { $eq: ['$ad', '$$adId'] },
                  { $lt: ['$createdAt', '$$createdAt'] }
                ]
              }
            }
          }
        ],
        as: 'previousMessages'
      }
    },
    {
      $addFields: {
        responseTime: {
          $cond: {
            if: { $gt: [{ $size: '$previousMessages' }, 0] },
            then: {
              $divide: [
                { $subtract: ['$createdAt', { $max: '$previousMessages.createdAt' }] },
                1000 * 60 // Convert to minutes
              ]
            },
            else: null
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseTime' },
        totalResponses: { $sum: 1 }
      }
    }
  ]);

  return {
    overview: {
      totalAds: adStats[0]?.totalAds || 0,
      totalViews: adStats[0]?.totalViews || 0,
      totalChats: adStats[0]?.totalChats || 0,
      promotedAds: adStats[0]?.promotedAds || 0,
      avgPrice: adStats[0]?.avgPrice || 0
    },
    revenue: {
      totalSpent: paymentStats[0]?.totalSpent || 0,
      promotionCount: paymentStats[0]?.promotionCount || 0,
      avgSpendPerAd: paymentStats[0]?.promotionCount > 0 ? 
        (paymentStats[0]?.totalSpent || 0) / paymentStats[0]?.promotionCount : 0
    },
    performance: {
      avgResponseTime: messageStats[0]?.avgResponseTime || 0,
      conversionRate: adStats[0]?.totalViews > 0 ? 
        ((adStats[0]?.totalChats || 0) / adStats[0]?.totalViews) * 100 : 0,
      viewsPerAd: adStats[0]?.totalAds > 0 ? 
        (adStats[0]?.totalViews || 0) / adStats[0]?.totalAds : 0
    },
    subscription: {
      plan: business.subscription.plan,
      status: business.subscription.status,
      endDate: business.subscription.endDate,
      daysUntilExpiry: business.daysUntilExpiry,
      autoRenew: business.subscription.autoRenew
    }
  };
};

// Static method to get expiring subscriptions
businessAccountSchema.statics.getExpiringSubscriptions = function (days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.find({
    'subscription.status': 'active',
    'subscription.endDate': { $lte: futureDate, $gte: new Date() }
  }).populate('userId', 'name email');
};

// Pre-save middleware to update analytics
businessAccountSchema.pre('save', async function(next) {
  if (this.isModified('analytics')) {
    this.updatedAt = new Date();
  }
  next();
});

const BusinessAccount = mongoose.model('BusinessAccount', businessAccountSchema);

module.exports = BusinessAccount;
