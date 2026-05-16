const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  markMessagesAsSeen,
  getUnreadCount,
  getConversations,
  deleteMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Protect all chat routes
router.use(protect);

// @route   POST /api/v1/chat/send
router.post('/send', sendMessage);

// @route   GET /api/v1/chat/conversation/:userId/:adId
router.get('/conversation/:userId/:adId', getConversation);

// @route   PUT /api/v1/chat/mark-seen
router.put('/mark-seen', markMessagesAsSeen);

// @route   GET /api/v1/chat/unread-count
router.get('/unread-count', getUnreadCount);

// @route   GET /api/v1/chat/conversations
router.get('/conversations', getConversations);

// @route   DELETE /api/v1/chat/message/:messageId
router.delete('/message/:messageId', deleteMessage);

module.exports = router;
