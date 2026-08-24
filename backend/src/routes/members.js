const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// Protect all member routes with authentication
router.use(authenticateUser);

// GET /api/members (Admin & Coordinator read-only) | POST /api/members (Admin only)
router
  .route('/')
  .get(authorizeRole('admin', 'coordinator'), getMembers)
  .post(authorizeRole('admin'), createMember);

// GET /api/members/:memberId (Admin & Coord) | PUT / DELETE (Admin only)
router
  .route('/:memberId')
  .get(authorizeRole('admin', 'coordinator'), getMemberById)
  .put(authorizeRole('admin'), updateMember)
  .delete(authorizeRole('admin'), deleteMember);

module.exports = router;
