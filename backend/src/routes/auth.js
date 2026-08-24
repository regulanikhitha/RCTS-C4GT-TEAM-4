const express = require('express');
const router = express.Router();
const { login, getMe, register } = require('../controllers/authController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Public route: Login
router.post('/login', login);

// Private route: Get current user
router.get('/me', authenticateUser, getMe);

// Admin-only route: Register user
router.post('/register', authenticateUser, authorizeRole('admin'), register);

module.exports = router;
