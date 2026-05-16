const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedType: {
    type: String,
    enum: ['ad', 'user', 'message'],
    required: true
  },
  reportedId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'fraud',
      'inappropriate_content',
      'fake_listing',
      'harassment',
      'violation_of_terms',
      'duplicate_listing',
      'misleading_information',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  evidence: [{
    type: String, // URLs to screenshots or other evidence
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'dismissed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin/moderator assigned to handle the report
  },
  resolution: {
    action: {
      type: String,
      enum: ['warning', 'suspension', 'ban', 'content_removal', 'no_action']
    },
    notes: String,
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  automatedFlags: {
    isDuplicate: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
    isFraud: { type: Boolean, default: false },
    confidence: { type: Number, default: 0 } // 0-1 confidence score
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
reportSchema.index({ reporterId: 1, createdAt: -1 });
reportSchema.index({ reportedId: 1, status: 1 });
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ assignedTo: 1, status: 1 });

// Static method to create automated report
reportSchema.statics.createAutomatedReport = async function(data) {
  const { reporterId, reportedType, reportedId, reason, description, automatedFlags } = data;
  
  // Check if similar report already exists
  const existingReport = await this.findOne({
    reporterId,
    reportedType,
    reportedId,
    reason,
    status: { $in: ['pending', 'under_review'] }
  });

  if (existingReport) {
    return existingReport;
  }

  // Determine priority based on automated flags
  let priority = 'medium';
  if (automatedFlags.isFraud || automatedFlags.confidence > 0.8) {
    priority = 'urgent';
  } else if (automatedFlags.isSpam || automatedFlags.confidence > 0.6) {
    priority = 'high';
  }

  return this.create({
    reporterId,
    reportedType,
    reportedId,
    reason,
    description,
    priority,
    automatedFlags
  });
};

// Static method to get report statistics
reportSchema.statics.getReportStatistics = async function (startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate,
      $lte: endDate
    }
  };

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        pendingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        underReviewReports: {
          $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] }
        },
        resolvedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        dismissedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] }
        },
        urgentReports: {
          $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
        },
        highReports: {
          $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
        },
        automatedReports: {
          $sum: { $cond: [{ $gt: ['$automatedFlags.confidence', 0] }, 1, 0] }
        }
      }
    }
  ]);
};

// Static method to get top reported items
reportSchema.statics.getTopReportedItems = async function (limit = 10) {
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    },
    {
      $group: {
        _id: {
          type: '$reportedType',
          id: '$reportedId'
        },
        reportCount: { $sum: 1 },
        uniqueReporters: { $addToSet: '$reporterId' },
        reasons: { $addToSet: '$reason' },
        lastReport: { $max: '$createdAt' }
      }
    },
    {
      $addFields: {
        uniqueReporterCount: { $size: '$uniqueReporters' }
      }
    },
    { $sort: { reportCount: -1, uniqueReporterCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'ads',
        localField: '_id.id',
        foreignField: '_id',
        as: 'adDetails',
        pipeline: [{ $project: { title: 1, price: 1 } }]
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.id',
        foreignField: '_id',
        as: 'userDetails',
        pipeline: [{ $project: { name: 1, email: 1 } }]
      }
    }
  ]);
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
