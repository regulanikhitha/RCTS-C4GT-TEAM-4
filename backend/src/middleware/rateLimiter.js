/**
 * In-memory sliding window rate limiter middleware for sensitive auth operations.
 */
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes
  max = 10,
  message = 'Too many requests from this IP. Please try again later.',
  keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip',
}) => {
  const hits = new Map();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hits.entries()) {
      if (now > record.resetTime) {
        hits.delete(key);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let record = hits.get(key);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      hits.set(key, record);
      return next();
    }

    record.count += 1;

    if (record.count > max) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        message,
        retryAfterSeconds,
      });
    }

    next();
  };
};

// Rate limiter instances for sensitive auth operations
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'Too many login attempts. Please try again in a few minutes.',
});

const otpRequestLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many OTP requests. Please wait a few minutes before requesting another OTP.',
});

const otpVerifyLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many OTP verification attempts. Please request a new OTP.',
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts. Please try again later.',
});

module.exports = {
  createRateLimiter,
  loginLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  resetPasswordLimiter,
};
