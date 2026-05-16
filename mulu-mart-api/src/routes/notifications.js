// routes/notifications.js
const express = require('express');
const {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  clearNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getNotifications)
  .delete(clearNotifications);

router
  .route('/unread-count')
  .get(getUnreadCount);

router
  .route('/read-all')
  .put(markAllAsRead);

router
  .route('/:id')
  .delete(deleteNotification);

module.exports = router;