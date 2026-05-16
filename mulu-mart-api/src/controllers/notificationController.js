// controllers/notificationController.js
const Notification = require('../models/Notification');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, read } = req.query;
  const skip = (page - 1) * limit;

  const query = { user: req.user.id };
  
  if (read === 'true' || read === 'false') {
    query.isRead = read === 'true';
  }

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(query)
  ]);

  // Mark notifications as read if they're being fetched for the first time
  if (read === 'false') {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n._id);

    if (unreadIds.length > 0) {
      await Notification.updateMany(
        { _id: { $in: unreadIds } },
        { $set: { isRead: true, readAt: Date.now() } }
      );

      // Update notifications in the response
      notifications.forEach(notification => {
        if (unreadIds.some(id => id.equals(notification._id))) {
          notification.isRead = true;
          notification.readAt = new Date();
        }
      });
    }
  }

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    pages: Math.ceil(total / limit),
    data: notifications
  });
});

// @desc    Get unread notification count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    data: { count }
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { $set: { isRead: true, readAt: Date.now() } }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!notification) {
    return next(
      new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/v1/notifications
// @access  Private
exports.clearNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});