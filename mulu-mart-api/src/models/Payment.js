const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  adId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ad', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  method: { 
    type: String, 
    enum: ['telebirr', 'cbe', 'awash', 'dashen'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'refunded'], 
    default: 'pending' 
  },
  promotionTier: { 
    type: String, 
    enum: ['bronze', 'silver', 'gold'], 
    required: true 
  },
  duration: {
    type: Number, // in days
    required: true,
    default: 7
  },
  webhookData: {
    received: { type: Boolean, default: false },
    verifiedAt: Date,
    payload: mongoose.Schema.Types.Mixed
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  completedAt: { 
    type: Date 
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ adId: 1, status: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Static method to get revenue analytics
paymentSchema.statics.getRevenueAnalytics = async function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          method: '$method',
          tier: '$promotionTier'
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.method',
        totalRevenue: { $sum: '$totalAmount' },
        transactions: { $sum: '$count' },
        tiers: {
          $push: {
            tier: '$_id.tier',
            revenue: '$totalAmount',
            count: '$count'
          }
        }
      }
    }
  ]);
};

// Static method to get user payment history
paymentSchema.statics.getUserPaymentHistory = async function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const payments = await this.find({ userId })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('adId', 'title')
    .populate('userId', 'name email');

  const total = await this.countDocuments({ userId });

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
