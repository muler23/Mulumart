// const cron = require('node-cron'); // Temporarily disabled
const paymentService = require('./paymentService');
const BusinessAccount = require('../models/BusinessAccount');
const Ad = require('../models/Ad');
const fraudDetectionService = require('./fraudDetectionService');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.intervals = new Map();
  }

  // Initialize all cron jobs
  initialize() {
    console.log('🕐 Initializing scheduled tasks...');

    // Check expired promotions every hour (3600000 ms)
    this.scheduleInterval('check-expired-promotions', 3600000, async () => {
      try {
        const expiredCount = await paymentService.checkExpiredPromotions();
        console.log(`⏰ Checked expired promotions: ${expiredCount} expired`);
      } catch (error) {
        console.error('❌ Error checking expired promotions:', error);
      }
    });

    // Check expiring business subscriptions every 12 hours (43200000 ms)
    this.scheduleInterval('check-expiring-subscriptions', 43200000, async () => {
      try {
        const expiringAccounts = await BusinessAccount.getExpiringSubscriptions(7);
        console.log(`⏰ Found ${expiringAccounts.length} expiring subscriptions`);
        
        // Here you would send notifications to expiring accounts
        expiringAccounts.forEach(account => {
          console.log(`📧 Subscription expiring soon: ${account.businessName} (${account.daysUntilExpiry} days)`);
        });
      } catch (error) {
        console.error('❌ Error checking expiring subscriptions:', error);
      }
    });

    // Run fraud detection scan every 6 hours (21600000 ms)
    this.scheduleInterval('fraud-detection-scan', 21600000, async () => {
      try {
        const results = await fraudDetectionService.runFraudDetectionScan();
        console.log(`🔍 Fraud detection scan completed:`, results);
      } catch (error) {
        console.error('❌ Error running fraud detection scan:', error);
      }
    });

    // Clean up old data daily (86400000 ms)
    this.scheduleInterval('cleanup-old-data', 86400000, async () => {
      try {
        await this.cleanupOldData();
        console.log('🧹 Old data cleanup completed');
      } catch (error) {
        console.error('❌ Error cleaning up old data:', error);
      }
    });

    // Update analytics every 6 hours (21600000 ms)
    this.scheduleInterval('update-analytics', 21600000, async () => {
      try {
        await this.updateAnalytics();
        console.log('📊 Analytics update completed');
      } catch (error) {
        console.error('❌ Error updating analytics:', error);
      }
    });

    console.log('✅ All scheduled tasks initialized');
  }

  // Schedule a new interval task
  scheduleInterval(name, interval, callback) {
    if (this.intervals.has(name)) {
      console.log(`⚠️ Task ${name} already exists, skipping...`);
      return;
    }

    const task = setInterval(callback, interval);
    this.intervals.set(name, task);
    console.log(`📅 Scheduled task: ${name} (every ${interval}ms)`);
  }

  // Stop a scheduled task
  stopTask(name) {
    const task = this.intervals.get(name);
    if (task) {
      clearInterval(task);
      this.intervals.delete(name);
      console.log(`⏹️ Stopped task: ${name}`);
      return true;
    }
    return false;
  }

  // Stop all scheduled tasks
  stopAllTasks() {
    this.intervals.forEach((task, name) => {
      clearInterval(task);
      console.log(`⏹️ Stopped task: ${name}`);
    });
    this.intervals.clear();
    console.log('⏹️ All scheduled tasks stopped');
  }

  // Get task status
  getTaskStatus() {
    const status = {};
    this.intervals.forEach((task, name) => {
      status[name] = {
        active: true,
        type: 'interval'
      };
    });
    return status;
  }

  // Clean up old data
  async cleanupOldData() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Clean up old messages (keep only last 30 days)
    const Message = require('../models/Message');
    const deletedMessages = await Message.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️ Deleted ${deletedMessages.deletedCount} old messages`);

    // Clean up old notifications
    const Notification = require('../models/Notification');
    const deletedNotifications = await Notification.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    console.log(`🗑️ Deleted ${deletedNotifications.deletedCount} old notifications`);

    // Archive resolved reports older than 90 days
    const Report = require('../models/Report');
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const archivedReports = await Report.updateMany(
      {
        status: { $in: ['resolved', 'dismissed'] },
        updatedAt: { $lt: ninetyDaysAgo }
      },
      { $set: { archived: true } }
    );
    console.log(`📦 Archived ${archivedReports.modifiedCount} old reports`);
  }

  // Update analytics
  async updateAnalytics() {
    // Update business account analytics
    const businesses = await BusinessAccount.find({ 'subscription.status': 'active' });
    
    for (const business of businesses) {
      const Ad = require('../models/Ad');
      const Message = require('../models/Message');
      
      // Calculate analytics for the past 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const [totalAds, totalViews, totalChats] = await Promise.all([
        Ad.countDocuments({ postedBy: business.userId, createdAt: { $gte: thirtyDaysAgo } }),
        Ad.aggregate([
          { $match: { postedBy: business.userId, createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, totalViews: { $sum: '$views' } } }
        ]),
        Message.countDocuments({ sender: business.userId, createdAt: { $gte: thirtyDaysAgo } })
      ]);

      business.analytics = {
        ...business.analytics,
        totalAds,
        totalViews: totalViews[0]?.totalViews || 0,
        totalChats,
        lastUpdated: new Date()
      };

      await business.save();
    }

    console.log(`📊 Updated analytics for ${businesses.length} business accounts`);
  }

  // Send daily summary to admins
  async sendDailySummary() {
    const User = require('../models/User');
    const Ad = require('../models/Ad');
    const Report = require('../models/Report');
    const Payment = require('../models/Payment');

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const [
      newUsers,
      newAds,
      pendingReports,
      todayRevenue,
      totalActiveUsers,
      totalActiveAds
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      Ad.countDocuments({ createdAt: { $gte: startOfDay } }),
      Report.countDocuments({ status: 'pending', createdAt: { $gte: startOfDay } }),
      Payment.aggregate([
        { $match: { status: 'completed', completedAt: { $gte: startOfDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments({ isBanned: { $ne: true }, isSuspended: { $ne: true } }),
      Ad.countDocuments({ status: 'approved', isActive: true })
    ]);

    const summary = {
      date: today.toDateString(),
      newUsers,
      newAds,
      pendingReports,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalActiveUsers,
      totalActiveAds
    };

    // Get admin users
    const admins = await User.find({ role: 'admin' });

    // Here you would send email notifications to admins
    console.log('📧 Daily Summary:', summary);
    console.log(`📧 Would send summary to ${admins.length} admin(s)`);

    return summary;
  }

  // Manually trigger a task
  async triggerTask(name) {
    const task = this.intervals.get(name);
    if (!task) {
      throw new Error(`Task ${name} not found`);
    }

    console.log(`🔄 Manually triggering task: ${name}`);
    
    // Get the callback and execute it
    const callbacks = {
      'check-expired-promotions': async () => {
        return await paymentService.checkExpiredPromotions();
      },
      'check-expiring-subscriptions': async () => {
        return await BusinessAccount.getExpiringSubscriptions(7);
      },
      'fraud-detection-scan': async () => {
        return await fraudDetectionService.runFraudDetectionScan();
      },
      'cleanup-old-data': async () => {
        return await this.cleanupOldData();
      },
      'update-analytics': async () => {
        return await this.updateAnalytics();
      },
      'daily-summary': async () => {
        return await this.sendDailySummary();
      }
    };

    if (callbacks[name]) {
      return await callbacks[name]();
    } else {
      throw new Error(`No callback defined for task: ${name}`);
    }
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService;
