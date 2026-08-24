const { verify } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware: Authenticates user via Bearer JWT token.
 * Attaches authenticated user document to req.user.
 */
const authenticateUser = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const decoded = verify(token);

    // Fetch user from DB to ensure they are still active
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        message: 'User account not found or is inactive.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: `Invalid or expired authentication token: ${error.message}`,
    });
  }
};

/**
 * Middleware: Authorizes specific roles.
 * Example: authorizeRole('admin'), authorizeRole('admin', 'coordinator')
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access forbidden. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user ? req.user.role : 'unauthenticated'}`,
      });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizeRole,
};
