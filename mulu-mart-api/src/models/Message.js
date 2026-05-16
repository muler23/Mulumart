const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: [true, 'Message must belong to an ad'],
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a sender'],
    },
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Message must have a recipient'],
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
      maxlength: [500, 'Message cannot be longer than 500 characters'],
    },
    status: { 
      type: String, 
      enum: ['sent', 'delivered', 'seen'], 
      default: 'sent' 
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    deliveredAt: Date,
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

// Enhanced indexes for performance
messageSchema.index({ ad: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, status: 1 });
messageSchema.index({ ad: 1, sender: 1, recipient: 1 });

// Virtual for checking if message is from current user
messageSchema.virtual('isFromSender').get(function() {
  return this.sender && this.recipient;
});

// Static method to mark messages as delivered
messageSchema.statics.markAsDelivered = async function (messageIds) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      status: { $ne: 'delivered' }
    },
    {
      $set: {
        status: 'delivered',
        deliveredAt: Date.now(),
      },
    }
  );
};

// Static method to mark messages as seen
messageSchema.statics.markAsSeen = async function (messageIds, userId) {
  return this.updateMany(
    {
      _id: { $in: messageIds },
      recipient: userId,
      status: { $ne: 'seen' }
    },
    {
      $set: {
        status: 'seen',
        isRead: true,
        readAt: Date.now(),
      },
    }
  );
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function (user1Id, user2Id, adId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const messages = await this.find({
    $or: [
      { sender: user1Id, recipient: user2Id, ad: adId },
      { sender: user2Id, recipient: user1Id, ad: adId },
    ],
  })
  .sort('-createdAt')
  .skip(skip)
  .limit(limit)
  .populate('sender', 'name photo')
  .populate('recipient', 'name photo');

  // Mark messages as seen for user1
  const unreadMessages = messages.filter(
    (msg) => msg.recipient.toString() === user1Id.toString() && msg.status !== 'seen'
  );
  
  if (unreadMessages.length > 0) {
    await this.markAsSeen(
      unreadMessages.map((msg) => msg._id),
      user1Id
    );
  }

  return messages.reverse();
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({
    recipient: userId,
    status: { $ne: 'seen' }
  });
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
