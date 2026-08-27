const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('../controllers/authController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');
const {
  loginLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  resetPasswordLimiter,
} = require('../middleware/rateLimiter');

// 1. Public Auth & Login (Rate-limited)
router.post('/login', loginLimiter, login);

// 2. Password Recovery / OTP Endpoints (Rate-limited)
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/verify-otp', otpVerifyLimiter, verifyOtp);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

// 3. Authenticated User Profile
router.get('/me', authenticateUser, getMe);

// 4. Admin-only User Registration
router.post('/register', authenticateUser, authorizeRole('admin'), register);

module.exports = router;
