const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');

// Member B routes: List members (supports ?role= filter) & Create member
router.route('/').get(getMembers).post(createMember);

// Member B & C routes: Get single member, Update member (PUT/PATCH), Delete member (DELETE)
router
  .route('/:id')
  .get(getMemberById)
  .put(updateMember)
  .patch(updateMember)
  .delete(deleteMember);

module.exports = router;
