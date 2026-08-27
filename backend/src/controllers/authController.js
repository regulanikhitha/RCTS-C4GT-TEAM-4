const crypto = require('crypto');
const User = require('../models/User');
const Coordinator = require('../models/Coordinator');
const Otp = require('../models/Otp');
const { sign } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');
const {
  sendLoginNotificationEmail,
  sendOtpEmail,
  sendPasswordResetConfirmationEmail,
} = require('../utils/mailer');

/**
 * Helper to validate password strength:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one numeric digit (0-9)' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  return { valid: true };
};

/**
 * @desc    Authenticate user & get JWT token + send login notification email
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials. User not found.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    // If role is coordinator, verify whitelist in Coordinator collection
    if (user.role === 'coordinator') {
      const authorizedCoordinator = await Coordinator.findOne({
        email: normalizedEmail,
        isActive: true,
      });

      if (!authorizedCoordinator) {
        return res.status(403).json({
          message: 'Access denied. Coordinator email is not authorized or is inactive.',
        });
      }
    }

    // Verify password
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    // Generate JWT token
    const token = sign({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      memberId: user.memberId,
    });

    // 📧 Asynchronously send Login Notification Email (non-blocking)
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    sendLoginNotificationEmail({
      email: user.email,
      name: user.name,
      loginTime: new Date(),
      ipAddress: clientIp,
      userAgent,
    }).catch((err) => {
      console.error(`⚠️ Failed to dispatch login notification email for ${user.email}:`, err.message);
    });

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId,
        rollNo: user.rollNo || null,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Register a new user (Admin only or bootstrap)
 * @route   POST /api/auth/register
 * @access  Private (Admin)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, memberId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    // Password strength check
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return res.status(400).json({ message: strengthCheck.message });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists',
      });
    }

    const hashedPassword = hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'student',
      memberId: memberId ? memberId.trim() : null,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        memberId: newUser.memberId,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Initiate Forgot Password flow & send time-limited OTP
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find active user
    const user = await User.findOne({ email: normalizedEmail, isActive: true });

    // Note: Always respond with generic success message to prevent user enumeration attacks
    const genericResponse = {
      message: 'If an account associated with this email exists, a verification code has been sent to your email.',
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    // Invalidate any previous OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      isVerified: false,
    });

    // 📧 Asynchronously send OTP Email
    sendOtpEmail({
      email: user.email,
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    }).catch((err) => {
      console.error(`⚠️ Failed to dispatch OTP email for ${user.email}:`, err.message);
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Verify OTP for Password Reset
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Both email and verification OTP are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Find the latest active unverified OTP for this email
    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        message: 'Invalid or expired verification code. Please request a new OTP.',
      });
    }

    // Check if max verification attempts reached
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
    }

    // Compare OTP hash using SHA-256
    const submittedHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');

    if (submittedHash !== otpDoc.otpHash) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      const remaining = otpDoc.maxAttempts - otpDoc.attempts;

      if (remaining <= 0) {
        await Otp.deleteOne({ _id: otpDoc._id });
        return res.status(400).json({
          message: 'Incorrect OTP. Maximum attempts reached. Please request a new OTP.',
          remainingAttempts: 0,
        });
      }

      return res.status(400).json({
        message: `Incorrect verification code. ${remaining} attempt(s) remaining.`,
        remainingAttempts: remaining,
      });
    }

    // OTP is valid -> generate single-use resetToken (valid for 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    otpDoc.isVerified = true;
    otpDoc.resetToken = resetToken;
    otpDoc.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await otpDoc.save();

    return res.status(200).json({
      message: 'OTP verified successfully. You may now proceed to set a new password.',
      resetToken,
      email: normalizedEmail,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Set New Password using verified resetToken
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'Email, reset token, new password, and password confirmation are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New password and confirmation password do not match',
      });
    }

    // Validate password complexity
    const strengthCheck = validatePasswordStrength(newPassword);
    if (!strengthCheck.valid) {
      return res.status(400).json({
        message: strengthCheck.message,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Verify resetToken in Otp collection
    const otpDoc = await Otp.findOne({
      email: normalizedEmail,
      resetToken: String(resetToken).trim(),
      isVerified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({
        message: 'Invalid, expired, or unverified password reset session. Please request a new OTP.',
      });
    }

    // Find User
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    // Securely hash the new password using scrypt
    const hashedPassword = hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    // Invalidate all OTPs and reset tokens for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // 📧 Asynchronously send Password Reset Confirmation Email
    sendPasswordResetConfirmationEmail({
      email: user.email,
      name: user.name,
      resetTime: new Date(),
    }).catch((err) => {
      console.error(`⚠️ Failed to dispatch reset confirmation email for ${user.email}:`, err.message);
    });

    return res.status(200).json({
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  getMe,
  register,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
