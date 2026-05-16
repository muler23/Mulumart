const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');

class PaymentService {
  constructor() {
    this.telebirrConfig = {
      apiKey: process.env.TELEBIRR_API_KEY,
      secret: process.env.TELEBIRR_SECRET_KEY,
      baseUrl: process.env.TELEBIRR_BASE_URL || 'https://api.telebirr.com',
      webhookUrl: process.env.TELEBIRR_WEBHOOK_URL
    };

    // Promotion tier pricing (in ETB)
    this.tierPricing = {
      bronze: { amount: 50, duration: 7 },   // 50 ETB for 7 days
      silver: { amount: 120, duration: 14 }, // 120 ETB for 14 days  
      gold: { amount: 250, duration: 30 }   // 250 ETB for 30 days
    };
  }

  // Initiate payment with multiple providers
  async initiatePayment(paymentData) {
    try {
      const { userId, adId, promotionTier, method, accountNumber, returnUrl, cancelUrl } = paymentData;
      const pricing = this.tierPricing[promotionTier];
      
      if (!pricing) {
        throw new ErrorResponse('Invalid promotion tier', 400);
      }

      // Generate transaction reference
      const reference = this.generateTransactionReference();

      // Save initial payment record
      const payment = await Payment.create({
        transactionId: reference,
        userId,
        adId,
        amount: pricing.amount,
        method,
        accountNumber: this.maskAccountNumber(accountNumber), // Store masked account number
        status: 'pending',
        promotionTier,
        duration: pricing.duration,
        returnUrl,
        cancelUrl,
        webhookData: {
          received: false,
          payload: null
        }
      });

      console.log(`💳 Payment initiated: ${reference} - ${method} - ${pricing.amount} ETB`);

      // Route to appropriate payment provider
      switch (method) {
        case 'telebirr':
          return await this.initiateTelebirrPayment({
            ...paymentData,
            reference,
            payment
          });
        
        case 'cbe':
        case 'abyssinia':
        case 'awash':
        case 'zemen':
        case 'dashen':
          return await this.initiateBankPayment({
            ...paymentData,
            reference,
            payment,
            bankName: method.toUpperCase()
          });
        
        default:
          throw new ErrorResponse('Unsupported payment method', 400);
      }

    } catch (error) {
      console.error('❌ Payment initiation error:', error);
      throw new ErrorResponse('Failed to initiate payment', 500);
    }
  }

  // Mask account number for security
  maskAccountNumber(accountNumber) {
    if (!accountNumber) return '';
    if (accountNumber.length <= 4) return accountNumber;
    
    const start = accountNumber.substring(0, 3);
    const end = accountNumber.substring(accountNumber.length - 2);
    const middle = '*'.repeat(accountNumber.length - 5);
    
    return start + middle + end;
  }

  // Initiate Telebirr payment
  async initiateTelebirrPayment(paymentData) {
    try {
      const { userId, adId, promotionTier, accountNumber, returnUrl, cancelUrl, reference } = paymentData;
      const pricing = this.tierPricing[promotionTier];
      
      if (!pricing) {
        throw new ErrorResponse('Invalid promotion tier', 400);
      }

      // Check if we have real Telebirr credentials
      if (!this.telebirrConfig.apiKey || 
          this.telebirrConfig.apiKey.includes('your_') || 
          !this.telebirrConfig.secret ||
          this.telebirrConfig.secret.includes('your_')) {
        
        console.log('⚠️  Telebirr credentials not configured. Please update .env file with real API keys.');
        throw new ErrorResponse('Payment service not configured. Contact administrator.', 503);
      }

      // Real Telebirr API integration
      const payload = {
        apiKey: this.telebirrConfig.apiKey,
        amount: pricing.amount,
        currency: 'ETB',
        customer: accountNumber, // Use account number as customer identifier
        reference: reference || this.generateTransactionReference(),
        webhook: this.telebirrConfig.webhookUrl,
        return_url: returnUrl || `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: cancelUrl || `${process.env.CLIENT_URL}/payment/cancel`,
        description: `Mulu-Mart ${promotionTier} promotion - ${pricing.duration} days`,
        // Additional Telebirr required fields
        merchantId: process.env.TELEBIRR_MERCHANT_ID,
        timestamp: Date.now(),
        signature: this.generateRequestSignature(payload)
      };

      console.log('📱 Initiating REAL Telebirr payment:', {
        reference: payload.reference,
        amount: payload.amount,
        currency: payload.currency,
        customer: accountNumber
      });

      const response = await axios.post(
        `${this.telebirrConfig.baseUrl}/payment/create`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.telebirrConfig.apiKey}`,
            'X-Telebirr-Signature': payload.signature
          },
          timeout: 30000 // 30 seconds timeout
        }
      );

      return {
        success: true,
        data: {
          paymentUrl: response.data.payment_url || response.data.checkout_url,
          transactionId: payload.reference,
          amount: pricing.amount,
          currency: 'ETB'
        }
      };

    } catch (error) {
      console.error('❌ Telebirr payment initiation error:', error);
      throw new ErrorResponse('Failed to initiate payment', 500);
    }
  }

  // Initiate bank payment (CBE, Abyssinia, Awash, Zemen, Dashen)
  async initiateBankPayment(paymentData) {
    try {
      const { userId, adId, promotionTier, accountNumber, bankName, returnUrl, cancelUrl, reference } = paymentData;
      const pricing = this.tierPricing[promotionTier];
      
      if (!pricing) {
        throw new ErrorResponse('Invalid promotion tier', 400);
      }

      console.log(`🏦 Initiating ${bankName} bank payment for account: ${this.maskAccountNumber(accountNumber)}`);

      // For development/testing, create a mock bank payment flow
      // In production, replace with real bank API integration
      const mockResponse = {
        data: {
          reference: reference || this.generateTransactionReference(),
          payment_url: `${process.env.CLIENT_URL}/payment/success?reference=${reference || this.generateTransactionReference()}&amount=${pricing.amount}&tier=${promotionTier}&bank=${bankName}`,
          status: 'pending'
        }
      };

      // Save payment record
      await Payment.create({
        transactionId: mockResponse.data.reference,
        userId,
        adId,
        amount: pricing.amount,
        method: bankName.toLowerCase(),
        status: 'pending',
        promotionTier,
        duration: pricing.duration,
        webhookData: {
          received: false,
          payload: null
        }
      });

      console.log(`✅ ${bankName} payment initiated: ${mockResponse.data.reference}`);

      return {
        success: true,
        data: {
          paymentUrl: mockResponse.data.payment_url,
          transactionId: mockResponse.data.reference,
          amount: pricing.amount,
          currency: 'ETB'
        }
      };

    } catch (error) {
      console.error(`❌ ${paymentData.bankName} payment initiation error:`, error);
      throw new ErrorResponse('Failed to initiate payment', 500);
    }
  }

  // Verify Telebirr webhook
  async verifyTelebirrWebhook(payload, signature) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', this.telebirrConfig.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('❌ Invalid webhook signature');
        return { success: false, message: 'Invalid signature' };
      }

      console.log('🔐 Webhook signature verified successfully');

      const { reference, status, transaction_id } = payload;

      // Find payment record
      const payment = await Payment.findOne({ 
        transactionId: reference,
        'webhookData.received': false 
      });

      if (!payment) {
        console.error('❌ Payment not found for reference:', reference);
        return { success: false, message: 'Payment not found' };
      }

      // Update payment record
      payment.webhookData = {
        received: true,
        verifiedAt: new Date(),
        payload
      };

      if (status === 'completed' || status === 'success') {
        payment.status = 'completed';
        payment.completedAt = new Date();
        
        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + payment.duration);
        payment.expiresAt = expiresAt;

        // Activate promotion
        await this.activatePromotion(payment.adId, payment.promotionTier, expiresAt);

        console.log(`✅ Payment completed: ${reference} - ${payment.promotionTier} promotion activated`);

      } else if (status === 'failed' || status === 'cancelled') {
        payment.status = 'failed';
        console.log(`❌ Payment failed: ${reference}`);
      }

      await payment.save();

      return { 
        success: true, 
        payment: {
          transactionId: reference,
          status: payment.status,
          promotionTier: payment.promotionTier
        }
      };

    } catch (error) {
      console.error('❌ Webhook verification error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }

  // Activate promotion for ad
  async activatePromotion(adId, tier, expiresAt) {
    try {
      await Ad.findByIdAndUpdate(adId, {
        isPromoted: true,
        promotionTier: tier,
        promotionExpiresAt: expiresAt,
        priorityScore: this.calculatePriorityScore(tier)
      });

      console.log(`🚀 Promotion activated for ad ${adId} - ${tier} tier until ${expiresAt}`);
    } catch (error) {
      console.error('❌ Promotion activation error:', error);
      throw error;
    }
  }

  // Calculate priority score based on tier
  calculatePriorityScore(tier) {
    const scores = {
      bronze: 10,
      silver: 25,
      gold: 50
    };
    return scores[tier] || 0;
  }

  // Check and expire promotions
  async checkExpiredPromotions() {
    try {
      const expiredAds = await Ad.find({
        isPromoted: true,
        promotionExpiresAt: { $lte: new Date() }
      });

      for (const ad of expiredAds) {
        ad.isPromoted = false;
        ad.promotionTier = null;
        ad.promotionExpiresAt = null;
        ad.priorityScore = 0;
        await ad.save();
        
        console.log(`⏰ Promotion expired for ad: ${ad._id}`);
      }

      return expiredAds.length;
    } catch (error) {
      console.error('❌ Error checking expired promotions:', error);
      return 0;
    }
  }

  // Generate request signature for Telebirr
  generateRequestSignature(payload) {
    const crypto = require('crypto');
    const sortedKeys = Object.keys(payload).sort();
    const queryString = sortedKeys
      .map(key => `${key}=${payload[key]}`)
      .join('&');
    
    return crypto
      .createHmac('sha256', this.telebirrConfig.secret)
      .update(queryString)
      .digest('hex');
  }

  // Generate unique transaction reference
  generateTransactionReference() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `MLM_${timestamp}_${random}`.toUpperCase();
  }

  // Get payment analytics
  async getPaymentAnalytics(startDate, endDate) {
    try {
      return await Payment.getRevenueAnalytics(startDate, endDate);
    } catch (error) {
      console.error('❌ Analytics error:', error);
      throw error;
    }
  }

  // Get user payment history
  async getUserPaymentHistory(userId, page = 1, limit = 20) {
    try {
      return await Payment.getUserPaymentHistory(userId, page, limit);
    } catch (error) {
      console.error('❌ Payment history error:', error);
      throw error;
    }
  }

  // Process bank payment (placeholder for future implementation)
  async initiateBankPayment(paymentData) {
    // TODO: Implement Ethiopian bank payment integration
    // CBE, Awash, Dashen Bank etc.
    throw new ErrorResponse('Bank payments coming soon', 501);
  }

  // Refund payment
  async processRefund(transactionId, reason) {
    try {
      const payment = await Payment.findOne({ transactionId });
      
      if (!payment) {
        throw new ErrorResponse('Payment not found', 404);
      }

      if (payment.status !== 'completed') {
        throw new ErrorResponse('Only completed payments can be refunded', 400);
      }

      // Update payment status
      payment.status = 'refunded';
      await payment.save();

      // Deactivate promotion if active
      if (payment.adId) {
        await Ad.findByIdAndUpdate(payment.adId, {
          isPromoted: false,
          promotionTier: null,
          promotionExpiresAt: null,
          priorityScore: 0
        });
      }

      console.log(`💰 Payment refunded: ${transactionId} - Reason: ${reason}`);

      return { success: true, message: 'Refund processed successfully' };
    } catch (error) {
      console.error('❌ Refund error:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
