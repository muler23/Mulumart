// controllers/messageController.js
const Message = require('../models/Message');
const User = require('../models/User');
const Ad = require('../models/Ad');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get messages between two users for an ad
// @route   GET /api/v1/messages/:adId/:recipientId
// @access  Private
exports.getMessages = asyncHandler(async (req, res, next) => {
  const { adId, recipientId } = req.params;
  const userId = req.user._id;

  // Validate ObjectId format
  if (!adId.match(/^[0-9a-fA-F]{24}$/) || !recipientId.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ErrorResponse('Invalid ID format', 400));
  }

  // Make sure user is part of the conversation
  if (userId === recipientId) {
    return next(new ErrorResponse('Cannot message yourself', 400));
  }

  // Check if ad exists
  const ad = await Ad.findById(adId);
  if (!ad) {
    return next(new ErrorResponse('Ad not found', 404));
  }

  const messages = await Message.find({
    $or: [
      { sender: userId, recipient: recipientId, ad: adId },
      { sender: recipientId, recipient: userId, ad: adId }
    ]
  })
    .sort('createdAt')
    .populate('sender', 'name photo')
    .populate('recipient', 'name photo');

  // Mark messages as read
  const unreadMessages = messages.filter(
    msg => !msg.isRead && msg.recipient.toString() === userId
  );

  if (unreadMessages.length > 0) {
    const messageIds = unreadMessages.map(msg => msg._id);
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $set: { isRead: true, readAt: Date.now() } }
    );
  }

  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages
  });
});

// @desc    Get user's conversations
// @route   GET /api/v1/messages/conversations
// @access  Private
exports.getConversations = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [{ sender: userId }, { recipient: userId }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: {
            if: { $eq: ['$sender', userId] },
            then: { ad: '$ad', user: '$recipient' },
            else: { ad: '$ad', user: '$sender' }
          }
        },
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$recipient', userId] }, { $eq: ['$isRead', false] }] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.user',
        foreignField: '_id',
        as: 'user'
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
      $unwind: '$user'
    },
    {
      $unwind: '$ad'
    },
    {
      $project: {
        _id: '$_id',
        ad: {
          _id: '$ad._id',
          title: '$ad.title',
          price: '$ad.price',
          images: '$ad.images'
        },
        user: {
          _id: '$user._id',
          name: '$user.name',
          profileImage: '$user.photo'
        },
        lastMessage: '$lastMessage',
        unreadCount: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: conversations.length,
    data: conversations
  });
});

// @desc    Send message
// @route   POST /api/v1/messages
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
  try {
    const { recipient, ad, message, senderContactInfo } = req.body;
    const sender = req.user._id;

    console.log('=== PROFESSIONAL MESSAGE SYSTEM ===');
    console.log('Request body:', { recipient, ad, message: message?.substring(0, 50) + '...' });
    console.log('Sender ID:', sender);
    console.log('Sender contact info:', senderContactInfo);

    // Validate required fields
    if (!recipient || !ad || !message) {
      console.log('VALIDATION ERROR: Missing required fields');
      return next(new ErrorResponse('Recipient, ad, and message are required', 400));
    }

    if (message.trim().length === 0) {
      console.log('VALIDATION ERROR: Empty message');
      return next(new ErrorResponse('Message cannot be empty', 400));
    }

    if (message.trim().length > 1000) {
      console.log('VALIDATION ERROR: Message too long');
      return next(new ErrorResponse('Message cannot exceed 1000 characters', 400));
    }

    // Check if recipient exists
    const recipientUser = await User.findById(recipient);
    if (!recipientUser) {
      console.log('VALIDATION ERROR: Recipient not found');
      return next(new ErrorResponse('Recipient not found', 404));
    }

    // Check if ad exists
    const adExists = await Ad.findById(ad);
    if (!adExists) {
      console.log('VALIDATION ERROR: Ad not found');
      return next(new ErrorResponse('Ad not found', 404));
    }

    console.log('Ad Owner ID:', adExists.postedBy);
    console.log('Sender ID:', sender);
    console.log('Recipient ID:', recipient);

    // Make sure user is not sending message to themselves
    if (sender.toString() === recipient.toString()) {
      console.log('VALIDATION ERROR: User messaging themselves');
      return next(new ErrorResponse('You cannot send a message to yourself', 400));
    }

    // Professional validation: Allow communication between ad owner and buyer
    const adOwnerId = adExists.postedBy.toString();
    const isSenderOwner = sender.toString() === adOwnerId;
    const isRecipientOwner = recipient.toString() === adOwnerId;

    if (!isSenderOwner && !isRecipientOwner) {
      console.log('VALIDATION ERROR: Neither participant is ad owner');
      return next(new ErrorResponse('Only ad owner and interested buyers can communicate', 400));
    }

    // Set correct sender and recipient - FIX FOR BOTH DIRECTIONS
    let actualSender, actualRecipient;
    
    if (isSenderOwner) {
      // SENDER IS AD OWNER (seller replying to buyer)
      actualSender = sender; // Keep as ad owner
      actualRecipient = recipient; // Send to original buyer
    } else {
      // SENDER IS BUYER (buyer messaging ad owner)
      actualSender = sender; // Keep as buyer
      actualRecipient = adOwnerId; // Send to ad owner
    }

    console.log('🎯 FIXED ROUTING - Sender:', actualSender, 'Recipient:', actualRecipient);
    console.log('Is sender owner?', isSenderOwner);
    console.log('Ad owner ID:', adOwnerId);

    // Create message with sender contact information
    const messageData = {
      sender: actualSender,
      recipient: actualRecipient,
      ad,
      message: message.trim(),
      // Include sender contact information for receiver
      senderContactInfo: senderContactInfo || {
        name: '',
        email: '',
        phone: ''
      }
    };

    const newMessage = await Message.create(messageData);

    console.log('✅ Message created successfully:', newMessage._id);

    // Populate sender and recipient
    await Message.populate(newMessage, [
      { path: 'sender', select: 'name photo' },
      { path: 'recipient', select: 'name photo' }
    ]);

    console.log('✅ Message populated successfully');

    // Professional socket emission - SEND TO BOTH USERS
    const io = req.app.get('io');
    
    console.log('🚀 EMITTING TO BOTH USERS');
    console.log('Sender ID:', actualSender);
    console.log('Receiver ID:', actualRecipient);
    console.log('Message ID:', newMessage._id);
    console.log('Message content:', message.substring(0, 30) + '...');
    
    // Check if users are in rooms before emission
    const senderRoom = Array.from(io.sockets.adapter.rooms).find(room => room === actualSender.toString());
    const receiverRoom = Array.from(io.sockets.adapter.rooms).find(room => room === actualRecipient.toString());
    
    console.log('Sender in room:', !!senderRoom);
    console.log('Receiver in room:', !!receiverRoom);
    console.log('All active rooms:', Array.from(io.sockets.adapter.rooms));
    
    // Emit to RECEIVER
    const receiverEmit = io.to(actualRecipient).emit('receiveMessage', newMessage);
    console.log('✅ Emitted to receiver:', actualRecipient, 'Success:', !!receiverEmit);
    
    // Emit to SENDER (for confirmation and live display)
    const senderEmit = io.to(actualSender).emit('receiveMessage', newMessage);
    console.log('✅ Emitted to sender:', actualSender, 'Success:', !!senderEmit);
    
    // Verify emission results
    setTimeout(() => {
      console.log('🔍 POST-EMISSION VERIFICATION');
      console.log('Expected: Both users should receive message');
      console.log('Actual: Check browser consoles for receiveMessage events');
    }, 1000);
    
    console.log('🎯 MESSAGE DELIVERY COMPLETE');

    console.log('=== END PROFESSIONAL MESSAGE SYSTEM ===');

    res.status(201).json({
      success: true,
      data: newMessage
    });

  } catch (error) {
    console.error('💥 MESSAGE SYSTEM ERROR:', error);
    return next(new ErrorResponse('Failed to send message. Please try again.', 500));
  }
});

// @desc    Mark messages as read
// @route   PUT /api/v1/messages/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const { messageIds } = req.body;

  if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
    return next(new ErrorResponse('Please provide message IDs', 400));
  }

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      recipient: req.user._id,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: Date.now()
      }
    }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark conversation as read
// @route   PUT /api/v1/messages/conversations/:conversationId/read
// @access  Private
exports.markConversationAsRead = asyncHandler(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Find all unread messages in this conversation for the current user
  await Message.updateMany(
    {
      $or: [
        { sender: conversationId, recipient: userId },
        { sender: userId, recipient: conversationId }
      ],
      recipient: userId,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: Date.now()
      }
    }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});