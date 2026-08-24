const User = require('../models/User');
const Coordinator = require('../models/Coordinator');
const { sign } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/password');

/**
 * @desc    Authenticate user & get JWT token
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

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        memberId: user.memberId,
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

module.exports = {
  login,
  getMe,
  register,
};
