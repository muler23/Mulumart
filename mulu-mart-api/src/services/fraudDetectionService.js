const Ad = require('../models/Ad');
const User = require('../models/User');
const Message = require('../models/Message');
const Report = require('../models/Report');
const BusinessAccount = require('../models/BusinessAccount');

class FraudDetectionService {
  constructor() {
    this.riskThresholds = {
      spam: {
        maxAdsPerDay: 10,
        maxDuplicateAds: 3,
        maxSimilarAds: 5,
        suspiciousKeywords: [
          'urgent', 'emergency', 'quick cash', 'no verification',
          'western union', 'money transfer', 'wire transfer',
          'gift card', 'bitcoin', 'crypto', 'investment',
          'too good to be true', 'limited time', 'act now'
        ]
      },
      fraud: {
        maxPriceVariance: 0.3, // 30% variance from market price
        minAccountAge: 7, // days
        maxReportsPerDay: 5,
        suspiciousPatterns: [
          'phone_only_contact',
          'external_payment_only',
          'no_real_meeting',
          'pressure_tactics',
          'identity_concealment'
        ]
      },
      behavior: {
        maxMessagesPerMinute: 30,
        maxNewContactsPerHour: 50,
        suspiciousResponseTime: 0.1, // 10 seconds (too fast for human)
        minMessageLength: 5
      }
    };
  }

  // Analyze user activity for fraud signals
  async analyzeUserActivity(userId) {
    try {
      const signals = [];
      let riskScore = 0;

      // Check user account age
      const user = await User.findById(userId);
      if (user) {
        const accountAge = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
        if (accountAge < this.riskThresholds.fraud.minAccountAge) {
          signals.push({
            type: 'new_account',
            severity: 'medium',
            description: 'Account created recently',
            score: 0.3
          });
          riskScore += 0.3;
        }
      }

      // Check ad posting patterns
      const recentAds = await Ad.countDocuments({
        postedBy: userId,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentAds > this.riskThresholds.spam.maxAdsPerDay) {
        signals.push({
          type: 'excessive_posting',
          severity: 'high',
          description: `Posted ${recentAds} ads in 24 hours`,
          score: 0.6
        });
        riskScore += 0.6;
      }

      // Check for duplicate content
      const duplicateAds = await this.findDuplicateAds(userId);
      if (duplicateAds.length > this.riskThresholds.spam.maxDuplicateAds) {
        signals.push({
          type: 'duplicate_content',
          severity: 'medium',
          description: `${duplicateAds.length} duplicate ads found`,
          score: 0.4
        });
        riskScore += 0.4;
      }

      // Check chat behavior
      const chatSignals = await this.analyzeChatBehavior(userId);
      signals.push(...chatSignals);
      riskScore += chatSignals.reduce((sum, signal) => sum + signal.score, 0);

      // Check reports against user
      const recentReports = await Report.countDocuments({
        reportedId: userId,
        reportedType: 'user',
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      if (recentReports > this.riskThresholds.fraud.maxReportsPerDay) {
        signals.push({
          type: 'excessive_reports',
          severity: 'high',
          description: `${recentReports} reports in 24 hours`,
          score: 0.7
        });
        riskScore += 0.7;
      }

      // Cap risk score at 1.0
      riskScore = Math.min(riskScore, 1.0);

      return {
        userId,
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        signals,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error analyzing user activity:', error);
      throw error;
    }
  }

  // Analyze ad for fraud signals
  async analyzeAd(adId) {
    try {
      const ad = await Ad.findById(adId).populate('postedBy');
      if (!ad) {
        throw new Error('Ad not found');
      }

      const signals = [];
      let riskScore = 0;

      // Check for suspicious keywords
      const suspiciousKeywords = this.riskThresholds.spam.suspiciousKeywords;
      const adText = `${ad.title} ${ad.description}`.toLowerCase();
      
      const foundKeywords = suspiciousKeywords.filter(keyword => 
        adText.includes(keyword.toLowerCase())
      );

      if (foundKeywords.length > 0) {
        signals.push({
          type: 'suspicious_keywords',
          severity: 'medium',
          description: `Suspicious keywords: ${foundKeywords.join(', ')}`,
          score: 0.3 * foundKeywords.length
        });
        riskScore += 0.3 * foundKeywords.length;
      }

      // Check price anomalies
      if (ad.price && ad.category) {
        const priceAnomaly = await this.checkPriceAnomaly(ad.price, ad.category);
        if (priceAnomaly.isAnomalous) {
          signals.push({
            type: 'price_anomaly',
            severity: 'high',
            description: `Price ${priceAnomaly.variance}% ${priceAnomaly.variance > 0 ? 'above' : 'below'} market average`,
            score: 0.5
          });
          riskScore += 0.5;
        }
      }

      // Check contact information
      const contactSignals = this.analyzeContactInfo(ad);
      signals.push(...contactSignals);
      riskScore += contactSignals.reduce((sum, signal) => sum + signal.score, 0);

      // Check image patterns
      if (ad.images && ad.images.length > 0) {
        const imageSignals = await this.analyzeImages(ad.images);
        signals.push(...imageSignals);
        riskScore += imageSignals.reduce((sum, signal) => sum + signal.score, 0);
      }

      // Cap risk score at 1.0
      riskScore = Math.min(riskScore, 1.0);

      return {
        adId,
        riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        signals,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Error analyzing ad:', error);
      throw error;
    }
  }

  // Analyze chat behavior for spam patterns
  async analyzeChatBehavior(userId) {
    const signals = [];
    
    try {
      // Check message frequency
      const recentMessages = await Message.find({
        sender: userId,
        createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      });

      if (recentMessages.length > this.riskThresholds.behavior.maxMessagesPerHour) {
        signals.push({
          type: 'high_message_frequency',
          severity: 'medium',
          description: `${recentMessages.length} messages in last hour`,
          score: 0.4
        });
      }

      // Check for repetitive messages
      const messageTexts = recentMessages.map(msg => msg.message.toLowerCase());
      const uniqueMessages = new Set(messageTexts);
      
      if (messageTexts.length > 0 && uniqueMessages.size / messageTexts.length < 0.3) {
        signals.push({
          type: 'repetitive_messages',
          severity: 'medium',
          description: 'High percentage of duplicate messages',
          score: 0.3
        });
      }

      // Check response times (too fast = bot)
      const messagePairs = await this.getMessageResponsePairs(userId);
      const fastResponses = messagePairs.filter(pair => 
        pair.responseTime < this.riskThresholds.behavior.suspiciousResponseTime * 60 * 1000
      );

      if (fastResponses.length > messagePairs.length * 0.5) {
        signals.push({
          type: 'suspicious_response_time',
          severity: 'high',
          description: 'Unusually fast response times',
          score: 0.5
        });
      }

      // Check for external links or contact info
      const messagesWithLinks = recentMessages.filter(msg => 
        this.containsExternalLinks(msg.message) || this.containsContactInfo(msg.message)
      );

      if (messagesWithLinks.length > recentMessages.length * 0.3) {
        signals.push({
          type: 'external_links',
          severity: 'high',
          description: 'High percentage of messages with external links',
          score: 0.6
        });
      }

    } catch (error) {
      console.error('❌ Error analyzing chat behavior:', error);
    }

    return signals;
  }

  // Find duplicate ads for a user
  async findDuplicateAds(userId) {
    const userAds = await Ad.find({ postedBy: userId }).sort('-createdAt');
    const duplicates = [];

    for (let i = 0; i < userAds.length; i++) {
      for (let j = i + 1; j < userAds.length; j++) {
        const similarity = this.calculateTextSimilarity(
          userAds[i].title + ' ' + userAds[i].description,
          userAds[j].title + ' ' + userAds[j].description
        );

        if (similarity > 0.8) {
          duplicates.push({
            original: userAds[i]._id,
            duplicate: userAds[j]._id,
            similarity
          });
        }
      }
    }

    return duplicates;
  }

  // Check price anomalies
  async checkPriceAnomaly(price, category) {
    try {
      const categoryAds = await Ad.find({ 
        category,
        price: { $exists: true, $gt: 0 },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      if (categoryAds.length < 5) {
        return { isAnomalous: false, variance: 0 };
      }

      const prices = categoryAds.map(ad => ad.price);
      const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const variance = Math.abs((price - mean) / mean);

      return {
        isAnomalous: variance > this.riskThresholds.fraud.maxPriceVariance,
        variance: variance * 100,
        mean,
        categoryAverage: mean
      };

    } catch (error) {
      console.error('❌ Error checking price anomaly:', error);
      return { isAnomalous: false, variance: 0 };
    }
  }

  // Analyze contact information in ad
  analyzeContactInfo(ad) {
    const signals = [];
    const text = `${ad.title} ${ad.description}`.toLowerCase();

    // Check for phone-only contact
    if (text.includes('call only') || text.includes('phone only') || text.includes('no messages')) {
      signals.push({
        type: 'phone_only_contact',
        severity: 'medium',
        description: 'Phone-only contact requested',
        score: 0.3
      });
    }

    // Check for external payment methods
    const externalPayments = ['western union', 'money transfer', 'wire transfer', 'gift card'];
    if (externalPayments.some(payment => text.includes(payment))) {
      signals.push({
        type: 'external_payment_only',
        severity: 'high',
        description: 'External payment methods mentioned',
        score: 0.5
      });
    }

    // Check for pressure tactics
    const pressureTactics = ['urgent', 'emergency', 'act now', 'limited time', 'today only'];
    if (pressureTactics.some(tactic => text.includes(tactic))) {
      signals.push({
        type: 'pressure_tactics',
        severity: 'medium',
        description: 'Pressure tactics detected',
        score: 0.3
      });
    }

    return signals;
  }

  // Analyze images for stock photos or watermarks
  async analyzeImages(images) {
    const signals = [];
    
    // This would integrate with image analysis service
    // For now, basic checks
    if (images.length === 0) {
      signals.push({
        type: 'no_images',
        severity: 'low',
        description: 'No images provided',
        score: 0.1
      });
    }

    // Check for single generic image
    if (images.length === 1 && images[0].url.includes('default') || images[0].url.includes('placeholder')) {
      signals.push({
        type: 'generic_image',
        severity: 'medium',
        description: 'Using generic/default image',
        score: 0.3
      });
    }

    return signals;
  }

  // Get message response pairs
  async getMessageResponsePairs(userId) {
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    }).sort('createdAt');

    const pairs = [];
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (current.recipient.toString() === userId && next.sender.toString() === userId) {
        pairs.push({
          responseTime: new Date(next.createdAt) - new Date(current.createdAt),
          message: next.message
        });
      }
    }

    return pairs;
  }

  // Check for external links
  containsExternalLinks(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return urlPattern.test(text);
  }

  // Check for contact information
  containsContactInfo(text) {
    const phonePattern = /(\+?251[-\s]?|0)?9\d{8}/g;
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    
    return phonePattern.test(text) || emailPattern.test(text);
  }

  // Calculate text similarity
  calculateTextSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // Get risk level from score
  getRiskLevel(score) {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.4) return 'medium';
    if (score >= 0.2) return 'low';
    return 'minimal';
  }

  // Create automated report for high-risk items
  async createAutomatedReport(data) {
    try {
      const { userId, adId, riskScore, signals } = data;
      
      if (riskScore < 0.6) return null; // Only create reports for medium-high risk

      const reason = signals[0]?.type || 'suspicious_activity';
      const description = `Automated detection: ${signals.map(s => s.description).join(', ')}`;
      
      const automatedFlags = {
        isSpam: signals.some(s => s.type.includes('spam')),
        isFraud: signals.some(s => s.type.includes('fraud')),
        confidence: riskScore
      };

      if (adId) {
        return await Report.createAutomatedReport({
          reporterId: 'system', // System-generated report
          reportedType: 'ad',
          reportedId: adId,
          reason,
          description,
          automatedFlags
        });
      } else if (userId) {
        return await Report.createAutomatedReport({
          reporterId: 'system',
          reportedType: 'user',
          reportedId: userId,
          reason,
          description,
          automatedFlags
        });
      }

    } catch (error) {
      console.error('❌ Error creating automated report:', error);
    }
  }

  // Run comprehensive fraud detection scan
  async runFraudDetectionScan() {
    try {
      console.log('🔍 Starting fraud detection scan...');
      
      const results = {
        usersAnalyzed: 0,
        adsAnalyzed: 0,
        reportsCreated: 0,
        highRiskUsers: 0,
        highRiskAds: 0
      };

      // Scan recent user activity
      const recentUsers = await User.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      for (const user of recentUsers) {
        const analysis = await this.analyzeUserActivity(user._id);
        results.usersAnalyzed++;
        
        if (analysis.riskScore >= 0.6) {
          results.highRiskUsers++;
          await this.createAutomatedReport({
            userId: user._id,
            riskScore: analysis.riskScore,
            signals: analysis.signals
          });
          results.reportsCreated++;
        }
      }

      // Scan recent ads
      const recentAds = await Ad.find({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      for (const ad of recentAds) {
        const analysis = await this.analyzeAd(ad._id);
        results.adsAnalyzed++;
        
        if (analysis.riskScore >= 0.6) {
          results.highRiskAds++;
          await this.createAutomatedReport({
            adId: ad._id,
            riskScore: analysis.riskScore,
            signals: analysis.signals
          });
          results.reportsCreated++;
        }
      }

      console.log('✅ Fraud detection scan completed:', results);
      return results;

    } catch (error) {
      console.error('❌ Error in fraud detection scan:', error);
      throw error;
    }
  }
}

module.exports = new FraudDetectionService();
