const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  publishNotification,
} = require('../controllers/notificationController');

const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Apply authentication to all notification routes
router.use(authenticateUser);

// GET all notifications (All roles can view)
router.get('/', getNotifications);

// Admin & Coordinator only routes
router.post('/', authorizeRole('admin', 'coordinator'), createNotification);
router.put('/:id', authorizeRole('admin', 'coordinator'), updateNotification);
router.delete('/:id', authorizeRole('admin', 'coordinator'), deleteNotification);
router.patch('/:id/publish', authorizeRole('admin', 'coordinator'), publishNotification);

module.exports = router;
