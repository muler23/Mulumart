const Message = require('../models/Message');
const Ad = require('../models/Ad');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Send message
// @route   POST /api/v1/chat/send
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { recipientId, adId, message } = req.body;

  // Validate ad exists
  const ad = await Ad.findById(adId);
  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  // Validate recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return next(new ErrorResponse('Recipient not found', 404));
  }

  // Create message
  const messageDoc = await Message.create({
    sender: req.user.id,
    recipient: recipientId,
    ad: adId,
    message: message.trim(),
    status: 'sent'
  });

  // Populate sender info
  await messageDoc.populate('sender', 'name photo');

  // Get socket instance
  const io = req.app.get('io');
  
  // Send to recipient's room
  io.to(`user_${recipientId}`).emit('message:new', {
    _id: messageDoc._id,
    sender: messageDoc.sender,
    recipient: recipientId,
    ad: adId,
    message: messageDoc.message,
    status: 'delivered',
    createdAt: messageDoc.createdAt
  });

  // Mark as delivered in database
  await Message.markAsDelivered([messageDoc._id]);

  res.status(201).json({
    success: true,
    data: {
      ...messageDoc.toObject(),
      status: 'sent'
    }
  });
});

// @desc    Get conversation
// @route   GET /api/v1/chat/conversation/:userId/:adId
// @access  Private
exports.getConversation = asyncHandler(async (req, res, next) => {
  const { userId, adId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Validate ad exists
  const ad = await Ad.findById(adId);
  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  // Get conversation
  const messages = await Message.getConversation(
    req.user.id,
    userId,
    adId,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: messages.length === parseInt(limit)
    }
  });
});

// @desc    Mark messages as seen
// @route   PUT /api/v1/chat/mark-seen
// @access  Private
exports.markMessagesAsSeen = asyncHandler(async (req, res, next) => {
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds)) {
    return next(new ErrorResponse('Message IDs are required', 400));
  }

  await Message.markAsSeen(messageIds, req.user.id);

  // Get socket instance
  const io = req.app.get('io');
  
  // Notify senders that messages were seen
  const messages = await Message.find({ _id: { $in: messageIds } }).select('sender');
  const uniqueSenders = [...new Set(messages.map(msg => msg.sender.toString()))];

  uniqueSenders.forEach(senderId => {
    io.to(`user_${senderId}`).emit('messages:seen', {
      messageIds,
      seenBy: req.user.id,
      seenAt: new Date()
    });
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread messages count
// @route   GET /api/v1/chat/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc    Get all conversations for user
// @route   GET /api/v1/chat/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  // Get latest message from each conversation
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id }
        ]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          ad: '$ad',
          otherUser: {
            $cond: {
              if: { $eq: ['$sender', req.user._id] },
              then: '$recipient',
              else: '$sender'
            }
          }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: {
              if: {
                $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $ne: ['$status', 'seen'] }
                ]
              },
              then: 1,
              else: 0
            }
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.otherUser',
        foreignField: '_id',
        as: 'otherUser'
      }
    },
    {
      $lookup: {
        from: 'ads',
        localField: '_id.ad',
        foreignField: '_id',
        as: 'ad'
      }
    },
    {
      $unwind: '$otherUser'
    },
    {
      $unwind: '$ad'
    },
    {
      $project: {
        ad: 1,
        otherUser: {
          _id: '$otherUser._id',
          name: '$otherUser.name',
          photo: '$otherUser.photo'
        },
        lastMessage: {
          _id: '$lastMessage._id',
          message: '$lastMessage.message',
          createdAt: '$lastMessage.createdAt',
          sender: '$lastMessage.sender'
        },
        unreadCount: 1,
        _id: 0
      }
    },
    { $skip: (page - 1) * limit },
    { $limit: parseInt(limit) }
  ]);

  res.status(200).json({
    success: true,
    data: conversations,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit)
    }
  });
});

// @desc    Delete message
// @route   DELETE /api/v1/chat/message/:messageId
// @access  Private
exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    return next(new ErrorResponse('Message not found', 404));
  }

  // Check if user owns the message
  if (message.sender.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this message', 401));
  }

  await message.remove();

  // Get socket instance
  const io = req.app.get('io');
  
  // Notify other user
  const otherUserId = message.recipient.toString();
  io.to(`user_${otherUserId}`).emit('message:deleted', {
    messageId: message._id,
    deletedBy: req.user.id
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});
