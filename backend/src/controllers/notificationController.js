const Notification = require('../models/Notification');

// @desc    Get all notifications (Students see published; Admin/Coordinator see all)
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const isStudent = req.user && req.user.role === 'student';
    const filter = isStudent ? { status: 'published' } : {};
    
    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Admin & Coordinator)
const createNotification = async (req, res) => {
  try {
    const { title, type, fromDate, toDate, time, message, status } = req.body;

    if (!title || !type || !fromDate || !toDate || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, type, fromDate, toDate, message',
      });
    }

    const newNotification = await Notification.create({
      title,
      type,
      fromDate,
      toDate,
      time: time || '',
      message,
      sendTo: 'All Members (81)',
      status: status === 'draft' ? 'draft' : 'published',
      createdBy: {
        name: req.user ? req.user.name || req.user.email : 'Admin',
        role: req.user ? req.user.role : 'admin',
        email: req.user ? req.user.email : 'admin@c4gt.com',
      },
    });

    return res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Notification saved as draft' : 'Notification published successfully',
      data: newNotification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message,
    });
  }
};

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin & Coordinator)
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, fromDate, toDate, time, message, status } = req.body;

    let notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.title = title || notification.title;
    notification.type = type || notification.type;
    notification.fromDate = fromDate || notification.fromDate;
    notification.toDate = toDate || notification.toDate;
    notification.time = time !== undefined ? time : notification.time;
    notification.message = message || notification.message;
    if (status) notification.status = status;

    const updatedNotification = await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: updatedNotification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification',
      error: error.message,
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin & Coordinator)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
      data: { id },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message,
    });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/notifications/:id/publish
// @access  Private (Admin & Coordinator)
const publishNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.status = notification.status === 'published' ? 'draft' : 'published';
    await notification.save();

    return res.status(200).json({
      success: true,
      message: `Notification ${notification.status === 'published' ? 'published' : 'saved as draft'} successfully`,
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update publish status',
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  publishNotification,
};
