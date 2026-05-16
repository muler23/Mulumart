// routes/messages.js
const express = require('express');
const {
  getMessages,
  getConversations,
  sendMessage,
  markAsRead,
  markConversationAsRead,
  getUnreadCount
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/:adId/:recipientId')
  .get(getMessages);

router
  .route('/conversations')
  .get(getConversations);

router
  .route('/')
  .post(sendMessage);

router
  .route('/read')
  .put(markAsRead);

router
  .route('/conversations/:conversationId/read')
  .put(markConversationAsRead);

router
  .route('/unread-count')
  .get(getUnreadCount);

module.exports = router;