const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Please add a message'],
      trim: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    attachments: [
      {
        url: String,
        type: {
          type: String,
          enum: ['image', 'document', 'other'],
          default: 'image',
        },
        name: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a compound index for faster querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, recipient: 1 });
MessageSchema.index({ ad: 1 });

// Static method to get conversation between two users for a specific ad
MessageSchema.statics.getConversation = async function (userId1, userId2, adId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  // Find the conversation ID (combination of user IDs and ad ID)
  const conversationId = [userId1, userId2, adId].sort().join('_');
  
  const messages = await this.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name profileImage')
    .populate('recipient', 'name profileImage')
    .lean();
    
  const total = await this.countDocuments({ conversationId });
  
  return {
    messages: messages.reverse(), // Return in chronological order
    page,
    pages: Math.ceil(total / limit),
    total,
  };
};

// Method to mark messages as read
MessageSchema.statics.markAsRead = async function (messageIds, userId) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      recipient: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: Date.now(),
      },
    }
  );
};

// Pre-save hook to set conversation ID
MessageSchema.pre('save', function (next) {
  if (this.isNew) {
    // Create a unique conversation ID by combining user IDs and ad ID
    const participants = [this.sender.toString(), this.recipient.toString(), this.ad.toString()].sort();
    this.conversationId = participants.join('_');
  }
  next();
});

// Virtual for getting unread message count
MessageSchema.virtual('unreadCount', {
  ref: 'Message',
  localField: 'recipient',
  foreignField: 'recipient',
  match: { isRead: false },
  count: true,
});

module.exports = mongoose.model('Message', MessageSchema);
