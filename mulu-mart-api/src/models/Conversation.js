const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Conversation must have participants'],
      },
    ],
    ad: {
      type: mongoose.Schema.ObjectId,
      ref: 'Ad',
      required: [true, 'Conversation must be related to an ad'],
    },
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message',
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
    deletedBy: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ ad: 1 });
conversationSchema.index({ 'participants.0': 1, 'participants.1': 1, ad: 1 }, { unique: true });

// Virtual for messages
conversationSchema.virtual('messages', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversationId',
});

// Populate participants and ad when finding conversations
conversationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'participants',
    select: 'name photo',
  })
    .populate({
      path: 'ad',
      select: 'title price images status',
    })
    .populate({
      path: 'lastMessage',
      select: 'content sender createdAt',
    });
  next();
});

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function (user1Id, user2Id, adId) {
  // Ensure consistent order of user IDs for the query
  const participants = [user1Id, user2Id].sort();
  
  let conversation = await this.findOne({
    participants: { $all: participants },
    ad: adId,
  });

  if (!conversation) {
    conversation = await this.create({
      participants,
      ad: adId,
    });
  }

  return conversation;
};

// Static method to get user conversations with pagination
conversationSchema.statics.getUserConversations = async function (userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  
  const conversations = await this.find({
    participants: userId,
    'deletedBy.user': { $ne: userId },
  })
    .sort('-updatedAt')
    .skip(skip)
    .limit(limit);

  return conversations;
};

// Instance method to mark messages as read
conversationSchema.methods.markAsRead = async function (userId) {
  if (this.unreadCount > 0) {
    this.unreadCount = 0;
    await this.save();
  }
};

// Instance method to soft delete conversation for a user
conversationSchema.methods.deleteForUser = async function (userId) {
  const userDeleted = this.deletedBy.some((item) => item.user.toString() === userId.toString());
  
  if (!userDeleted) {
    this.deletedBy.push({ user: userId });
    await this.save();
  }
  
  // If all participants have deleted the conversation, remove it
  const participantIds = this.participants.map((id) => id.toString());
  const deletedByUserIds = this.deletedBy.map((item) => item.user.toString());
  
  const allParticipantsDeleted = participantIds.every((id) => deletedByUserIds.includes(id));
  
  if (allParticipantsDeleted) {
    await this.remove();
    return true; // Indicates the conversation was fully deleted
  }
  
  return false; // Indicates the conversation was only soft-deleted for the user
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
