import api from './api';

class PaymentService {
  // Get promotion pricing
  async getPromotionPricing() {
    try {
      const response = await api.get('/payments/pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error;
    }
  }

  // Initiate payment
  async initiatePayment(adId, promotionTier, method, accountNumber, returnUrl, cancelUrl) {
    try {
      const response = await api.post('/payments/initiate', {
        adId,
        promotionTier,
        method,
        accountNumber,
        returnUrl,
        cancelUrl
      });
      
      return response.data;
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(page = 1, limit = 20) {
    try {
      const response = await api.get('/payments/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Process refund (admin only)
  async processRefund(transactionId, reason) {
    try {
      const response = await api.post('/payments/refund', {
        transactionId,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }

  // Get payment analytics (admin only)
  async getPaymentAnalytics(startDate, endDate) {
    try {
      const response = await api.get('/payments/analytics', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Format price in ETB
  formatPrice(amount) {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  }

  // Get promotion tier info
  getPromotionTierInfo(tier) {
    const tiers = {
      bronze: {
        name: 'Bronze',
        color: 'bg-amber-500',
        borderColor: 'border-amber-500',
        textColor: 'text-amber-600',
        description: 'Basic visibility boost',
        features: ['7 days duration', 'Priority placement', 'Basic analytics']
      },
      silver: {
        name: 'Silver',
        color: 'bg-gray-400',
        borderColor: 'border-gray-400',
        textColor: 'text-gray-600',
        description: 'Enhanced visibility',
        features: ['14 days duration', 'Top placement', 'Advanced analytics', 'Support badge']
      },
      gold: {
        name: 'Gold',
        color: 'bg-yellow-500',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-600',
        description: 'Maximum visibility',
        features: ['30 days duration', 'Premium placement', 'Full analytics', 'Priority support', 'Featured badge']
      }
    };
    
    return tiers[tier] || tiers.bronze;
  }

  // Calculate promotion ROI (for admin dashboard)
  calculateROI(promotionData) {
    const { amount, views, chats, conversions } = promotionData;
    
    // Simple ROI calculation
    const costPerView = amount / views;
    const costPerChat = amount / chats;
    const costPerConversion = amount / conversions;
    
    return {
      costPerView: this.formatPrice(costPerView),
      costPerChat: this.formatPrice(costPerChat),
      costPerConversion: this.formatPrice(costPerConversion),
      totalROI: conversions > 0 ? ((conversions * 100) / amount).toFixed(2) : 0
    };
  }

  // Validate payment method
  validatePaymentMethod(method) {
    const validMethods = ['telebirr', 'cbe', 'awash', 'dashen'];
    return validMethods.includes(method);
  }

  // Get payment method info
  getPaymentMethodInfo(method) {
    const methods = {
      telebirr: {
        name: 'Telebirr',
        icon: '📱',
        description: 'Pay with Telebirr mobile wallet',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      cbe: {
        name: 'CBE Birr',
        icon: '🏦',
        description: 'Pay with Commercial Bank of Ethiopia',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      awash: {
        name: 'Awash Bank',
        icon: '🏦',
        description: 'Pay with Awash Bank',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      dashen: {
        name: 'Dashen Bank',
        icon: '🏦',
        description: 'Pay with Dashen Bank',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    };
    
    return methods[method] || methods.telebirr;
  }

  // Generate payment summary
  generatePaymentSummary(promotionTier, duration) {
    const tierInfo = this.getPromotionTierInfo(promotionTier);
    const pricing = {
      bronze: { amount: 50, duration: 7 },
      silver: { amount: 120, duration: 14 },
      gold: { amount: 250, duration: 30 }
    };
    
    const pricingInfo = pricing[promotionTier];
    
    return {
      tier: tierInfo,
      pricing: pricingInfo,
      totalAmount: this.formatPrice(pricingInfo.amount),
      duration: `${pricingInfo.duration} days`,
      features: tierInfo.features,
      expiresAt: new Date(Date.now() + (pricingInfo.duration * 24 * 60 * 60 * 1000))
    };
  }
}

// Create singleton instance
const paymentService = new PaymentService();

export default paymentService;
