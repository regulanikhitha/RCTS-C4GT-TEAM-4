const crypto = require('crypto');
const { hashPassword, comparePassword } = require('./src/utils/password');
const { sign, verify } = require('./src/utils/jwt');
const {
  sendLoginNotificationEmail,
  sendOtpEmail,
  sendPasswordResetConfirmationEmail,
} = require('./src/utils/mailer');
const { createRateLimiter } = require('./src/middleware/rateLimiter');
const {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} = require('./src/controllers/authController');
const User = require('./src/models/User');
const Otp = require('./src/models/Otp');
const Coordinator = require('./src/models/Coordinator');

// In-memory mock storage
const mockUsers = new Map();
const mockOtps = new Map();

// Patch User and Otp model methods for unit testing
User.findOne = async (query) => {
  if (query.email) {
    const u = mockUsers.get(query.email.toLowerCase().trim());
    if (!u) return null;
    if (query.isActive !== undefined && u.isActive !== query.isActive) return null;
    return { ...u, save: async function() { mockUsers.set(this.email, this); return this; } };
  }
  return null;
};

User.create = async (doc) => {
  const user = { _id: 'user_' + Date.now(), ...doc, isActive: doc.isActive !== false };
  mockUsers.set(doc.email.toLowerCase().trim(), user);
  return user;
};

Otp.findOne = (query) => {
  const execute = async () => {
    for (const [id, otp] of mockOtps.entries()) {
      if (query.email && otp.email !== query.email.toLowerCase().trim()) continue;
      if (query.isVerified !== undefined && otp.isVerified !== query.isVerified) continue;
      if (query.resetToken && otp.resetToken !== query.resetToken) continue;
      if (query.expiresAt && query.expiresAt.$gt && otp.expiresAt <= query.expiresAt.$gt) continue;

      return {
        _id: id,
        ...otp,
        save: async function() {
          mockOtps.set(this._id, { ...this });
          return this;
        },
      };
    }
    return null;
  };

  return {
    sort: function() { return this; },
    then: function(resolve, reject) { return execute().then(resolve, reject); },
  };
};

Otp.find = async (query) => {
  const results = [];
  for (const otp of mockOtps.values()) {
    if (query.email && otp.email === query.email.toLowerCase().trim()) {
      results.push(otp);
    }
  }
  return results;
};

Otp.create = async (doc) => {
  const id = 'otp_' + Math.random().toString(36).substr(2, 9);
  const record = { _id: id, ...doc };
  mockOtps.set(id, record);
  return record;
};

Otp.deleteMany = async (query) => {
  if (query.email) {
    for (const [id, otp] of mockOtps.entries()) {
      if (otp.email === query.email.toLowerCase().trim()) {
        mockOtps.delete(id);
      }
    }
  }
  return { acknowledged: true };
};

Otp.deleteOne = async (query) => {
  if (query._id) {
    mockOtps.delete(query._id);
  }
  return { acknowledged: true };
};

// Helper mock response object
const createMockRes = () => {
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    set: function(k, v) { this.headers[k] = v; return this; },
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { this.body = data; return this; },
  };
  return res;
};

// Test Runner
const runAllTests = async () => {
  console.log('🧪 ========================================================');
  console.log('🚀 RUNNING SECURE AUTH & RECOVERY UNIT TEST SUITE');
  console.log('🧪 ========================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, msg) => {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      throw new Error(`Assertion failed: ${msg}`);
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  };

  // --- SECTION 1: Password Hashing & Crypto ---
  console.log('\n--- 1. Password Hashing & Verification Tests ---');
  const plainPassword = 'Student@Password123!';
  const hashedPassword = hashPassword(plainPassword);
  assert(hashedPassword.includes(':'), 'Hashed password format is salt:derivedKey');
  assert(comparePassword(plainPassword, hashedPassword), 'Correct password verifies successfully');
  assert(!comparePassword('WrongPassword', hashedPassword), 'Incorrect password fails verification');
  assert(!comparePassword('', hashedPassword), 'Empty password fails verification');

  // --- SECTION 2: JWT Generation & Verification ---
  console.log('\n--- 2. JWT Sign & Verify Tests ---');
  const token = sign({ id: '123', email: 'test@c4gt.com', role: 'student', name: 'Test Student' });
  assert(typeof token === 'string' && token.split('.').length === 3, 'JWT token has valid 3-part structure');
  const decoded = verify(token);
  assert(decoded.email === 'test@c4gt.com' && decoded.role === 'student', 'JWT decodes with accurate payload');

  // --- SECTION 3: Email Dispatch Utilities ---
  console.log('\n--- 3. Email Notification Template Tests ---');
  const loginEmailRes = await sendLoginNotificationEmail({
    email: 'member001@c4gt.com',
    name: 'Aarav Sharma',
    loginTime: new Date(),
    ipAddress: '127.0.0.1',
  });
  assert(loginEmailRes.success === true, 'sendLoginNotificationEmail dispatches successfully');

  const otpEmailRes = await sendOtpEmail({
    email: 'member001@c4gt.com',
    name: 'Aarav Sharma',
    otp: '489210',
    expiresInMinutes: 10,
  });
  assert(otpEmailRes.success === true, 'sendOtpEmail dispatches successfully');

  const resetEmailRes = await sendPasswordResetConfirmationEmail({
    email: 'member001@c4gt.com',
    name: 'Aarav Sharma',
    resetTime: new Date(),
  });
  assert(resetEmailRes.success === true, 'sendPasswordResetConfirmationEmail dispatches successfully');

  // --- SECTION 4: Rate Limiter Middleware ---
  console.log('\n--- 4. Rate Limiting Tests ---');
  const testLimiter = createRateLimiter({ windowMs: 1000, max: 3 });
  const mockReq = { ip: '192.168.1.1', headers: {}, socket: {} };
  let rateLimitBlocked = false;

  for (let i = 1; i <= 5; i++) {
    const mockRes = createMockRes();
    let nextCalled = false;
    testLimiter(mockReq, mockRes, () => { nextCalled = true; });
    if (i <= 3) {
      assert(nextCalled, `Request #${i} permitted within limit`);
    } else {
      assert(mockRes.statusCode === 429, `Request #${i} rejected with HTTP 429`);
      assert(mockRes.headers['Retry-After'] !== undefined, `Request #${i} returns Retry-After header`);
      rateLimitBlocked = true;
    }
  }
  assert(rateLimitBlocked, 'Rate limiter successfully enforced maximum limit');

  // --- SECTION 5: Student Login Controller ---
  console.log('\n--- 5. Student Login Controller Tests ---');
  const studentEmail = 'member001@c4gt.com';
  const initialPassword = 'Student@123';
  await User.create({
    name: 'Aarav Sharma',
    email: studentEmail,
    password: hashPassword(initialPassword),
    role: 'student',
    memberId: 'C4GT-001',
    isActive: true,
  });

  // Test invalid credentials
  const loginFailRes = createMockRes();
  await login({ body: { email: studentEmail, password: 'WrongPassword' }, ip: '127.0.0.1', headers: {}, socket: {} }, loginFailRes, (e) => {});
  assert(loginFailRes.statusCode === 401, 'Login with wrong password returns 401');

  // Test valid login
  const loginSuccessRes = createMockRes();
  await login({ body: { email: studentEmail, password: initialPassword }, ip: '127.0.0.1', headers: {}, socket: {} }, loginSuccessRes, (e) => {});
  assert(loginSuccessRes.statusCode === 200, 'Student login with valid credentials returns 200');
  assert(loginSuccessRes.body.token !== undefined, 'Login response includes JWT token');
  assert(loginSuccessRes.body.user.email === studentEmail, 'Login response includes user profile without password');

  // --- SECTION 6: Forgot Password Controller (Anti-Enumeration & OTP) ---
  console.log('\n--- 6. Forgot Password (OTP Generation) Tests ---');
  const forgotReq = { body: { email: studentEmail } };
  const forgotRes = createMockRes();
  await forgotPassword(forgotReq, forgotRes, (e) => {});
  assert(forgotRes.statusCode === 200, 'Forgot password returns 200 generic message');
  assert(forgotRes.body.message.includes('verification code has been sent'), 'Response is generic');

  // Check OTP doc created
  const createdOtp = await Otp.findOne({ email: studentEmail, isVerified: false });
  assert(createdOtp !== null, 'OTP record saved to database');
  assert(createdOtp.otpHash && createdOtp.otpHash.length === 64, 'OTP is stored as SHA-256 hash');
  assert(createdOtp.attempts === 0, 'OTP initialized with 0 attempts');

  // Anti-enumeration test with ghost email
  const ghostRes = createMockRes();
  await forgotPassword({ body: { email: 'nonexistent@c4gt.com' } }, ghostRes, (e) => {});
  assert(ghostRes.statusCode === 200, 'Non-existent email returns 200 generic message');
  assert(ghostRes.body.message === forgotRes.body.message, 'Generic message identical for registered and non-registered emails');

  // --- SECTION 7: OTP Verification Controller ---
  console.log('\n--- 7. OTP Verification Tests ---');
  // Inject a known OTP hash for testing
  const testOtpRaw = '784129';
  const testOtpHash = crypto.createHash('sha256').update(testOtpRaw).digest('hex');
  await Otp.deleteMany({ email: studentEmail });
  await Otp.create({
    email: studentEmail,
    otpHash: testOtpHash,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
    maxAttempts: 5,
    isVerified: false,
  });

  // Test wrong OTP
  const wrongOtpRes = createMockRes();
  await verifyOtp({ body: { email: studentEmail, otp: '000000' } }, wrongOtpRes, (e) => {});
  assert(wrongOtpRes.statusCode === 400, 'Wrong OTP returns 400');
  assert(wrongOtpRes.body.remainingAttempts === 4, 'Remaining attempts decremented to 4');

  // Test correct OTP
  const correctOtpRes = createMockRes();
  await verifyOtp({ body: { email: studentEmail, otp: testOtpRaw } }, correctOtpRes, (e) => {});
  assert(correctOtpRes.statusCode === 200, 'Correct OTP returns 200');
  assert(correctOtpRes.body.resetToken !== undefined, 'Response returns resetToken');
  const issuedResetToken = correctOtpRes.body.resetToken;

  // --- SECTION 8: Password Reset Controller & Strength Enforcement ---
  console.log('\n--- 8. Set New Password Tests ---');
  // Test password mismatch
  const mismatchRes = createMockRes();
  await resetPassword({
    body: {
      email: studentEmail,
      resetToken: issuedResetToken,
      newPassword: 'StrongPassword@2026',
      confirmPassword: 'DifferentPassword@2026',
    }
  }, mismatchRes, (e) => {});
  assert(mismatchRes.statusCode === 400, 'Mismatched passwords rejected with 400');

  // Test weak password (too short)
  const weakRes = createMockRes();
  await resetPassword({
    body: {
      email: studentEmail,
      resetToken: issuedResetToken,
      newPassword: 'pass',
      confirmPassword: 'pass',
    }
  }, weakRes, (e) => {});
  assert(weakRes.statusCode === 400, 'Weak password (<8 chars) rejected with 400');

  // Test weak password (no special char)
  const noSpecialRes = createMockRes();
  await resetPassword({
    body: {
      email: studentEmail,
      resetToken: issuedResetToken,
      newPassword: 'Password123',
      confirmPassword: 'Password123',
    }
  }, noSpecialRes, (e) => {});
  assert(noSpecialRes.statusCode === 400, 'Password without special character rejected with 400');

  // Test valid strong password reset
  const strongNewPassword = 'BrandNewPassword@2026!';
  const resetSuccessRes = createMockRes();
  await resetPassword({
    body: {
      email: studentEmail,
      resetToken: issuedResetToken,
      newPassword: strongNewPassword,
      confirmPassword: strongNewPassword,
    }
  }, resetSuccessRes, (e) => {});
  assert(resetSuccessRes.statusCode === 200, 'Password reset with strong password succeeds with 200');

  // Verify DB user password is updated
  const updatedUser = await User.findOne({ email: studentEmail });
  assert(comparePassword(strongNewPassword, updatedUser.password), 'User password in database matches new password');
  assert(!comparePassword(initialPassword, updatedUser.password), 'Old password no longer valid');

  // Verify OTP records deleted / invalidated
  const remainingOtps = await Otp.find({ email: studentEmail });
  assert(remainingOtps.length === 0, 'All OTPs & reset tokens invalidated after successful reset');

  // Verify login with old password fails & new password succeeds
  const oldLoginRes = createMockRes();
  await login({ body: { email: studentEmail, password: initialPassword }, ip: '127.0.0.1', headers: {}, socket: {} }, oldLoginRes, (e) => {});
  assert(oldLoginRes.statusCode === 401, 'Old password fails login');

  const newLoginRes = createMockRes();
  await login({ body: { email: studentEmail, password: strongNewPassword }, ip: '127.0.0.1', headers: {}, socket: {} }, newLoginRes, (e) => {});
  assert(newLoginRes.statusCode === 200, 'New password logs in successfully');

  console.log('\n========================================================');
  console.log(`🎉 ALL ${passed} / ${total} TESTS PASSED WITH 100% SUCCESS!`);
  console.log('========================================================\n');
};

runAllTests().catch((err) => {
  console.error('Fatal error in tests:', err);
  process.exit(1);
});
