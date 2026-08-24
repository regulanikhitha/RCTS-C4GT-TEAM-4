const express = require('express');
const router = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  getDailyAttendance,
  getMemberAttendance,
  getAttendanceStats,
  generateDailyReportPDF,
} = require('../controllers/attendanceController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// All attendance routes require authentication
router.use(authenticateUser);

// Download daily PDF report (Admin & Coordinator)
router.get('/report/:date', authorizeRole('admin', 'coordinator'), generateDailyReportPDF);

// Attendance statistics (Admin & Coordinator)
router.get('/stats', authorizeRole('admin', 'coordinator'), getAttendanceStats);

// Single member attendance history (Admin, Coordinator, or Own Student)
router.get('/member/:memberId', getMemberAttendance);

// Mark bulk attendance (Admin & Coordinator)
router.post('/bulk', authorizeRole('admin', 'coordinator'), markBulkAttendance);

// Daily attendance list (Admin & Coordinator) & Mark single attendance
router
  .route('/')
  .get(authorizeRole('admin', 'coordinator'), getDailyAttendance)
  .post(authorizeRole('admin', 'coordinator'), markAttendance);

// Update attendance record (Admin & Coordinator)
router.put('/:attendanceId', authorizeRole('admin', 'coordinator'), updateAttendance);

module.exports = router;
