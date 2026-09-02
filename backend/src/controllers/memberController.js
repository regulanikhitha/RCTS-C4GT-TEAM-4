const mongoose = require('mongoose');
const Member = require('../models/Member');

/**
 * @desc    Get all members (supports ?role=, ?department=, ?isActive= query filters)
 * @route   GET /api/members
 * @access  Private (Admin & Coordinator)
 */
const getMembers = async (req, res, next) => {
  try {
    const { role, department, isActive } = req.query;
    const filter = {};

    if (role) {
      const r = role.trim();
      if (/^lead/i.test(r)) {
        filter.$or = [
          { role: new RegExp('^lead', 'i') },
          { department: new RegExp('lead', 'i') },
        ];
      } else if (/^senior/i.test(r) || /^sd$/i.test(r)) {
        filter.role = new RegExp('^senior', 'i');
        filter.department = { $not: /lead/i };
      } else if (/^junior/i.test(r) || /^jd$/i.test(r)) {
        filter.role = new RegExp('^junior', 'i');
      } else {
        filter.role = new RegExp(`^${r}$`, 'i');
      }
    }

    if (department) {
      filter.department = new RegExp(`^${department.trim()}$`, 'i');
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const members = await Member.find(filter).sort({ memberId: 1, createdAt: 1 });
    return res.status(200).json({
      count: members.length,
      members,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get single member by memberId or MongoDB _id
 * @route   GET /api/members/:memberId
 * @access  Private (Admin & Coordinator)
 */
const getMemberById = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    let member = await Member.findOne({ memberId: memberId.trim() });

    if (!member && mongoose.Types.ObjectId.isValid(memberId)) {
      member = await Member.findById(memberId);
    }

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.status(200).json(member);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Create a new member
 * @route   POST /api/members
 * @access  Private (Admin only)
 */
const createMember = async (req, res, next) => {
  try {
    const { memberId, name, email, role, department, team, isActive, status } = req.body;

    const newMember = new Member({
      memberId: memberId || `C4GT-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: role || 'Junior Developer',
      department,
      team,
      isActive: isActive !== undefined ? isActive : true,
      status: status || 'active',
    });

    const savedMember = await newMember.save();
    return res.status(201).json(savedMember);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'Field';
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please provide a unique value.`,
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(', '),
      });
    }

    return next(error);
  }
};

/**
 * @desc    Update a member
 * @route   PUT /api/members/:memberId
 * @access  Private (Admin only)
 */
const updateMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    let filter = { memberId: memberId.trim() };
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      const exists = await Member.findOne({ memberId: memberId.trim() });
      if (!exists) {
        filter = { _id: memberId };
      }
    }

    const updatedMember = await Member.findOneAndUpdate(
      filter,
      { $set: req.body },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.status(200).json(updatedMember);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email or Member ID already exists. Please provide unique values.',
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        message: messages.join(', '),
      });
    }

    return next(error);
  }
};

/**
 * @desc    Delete a member
 * @route   DELETE /api/members/:memberId
 * @access  Private (Admin only)
 */
const deleteMember = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    let filter = { memberId: memberId.trim() };
    if (mongoose.Types.ObjectId.isValid(memberId)) {
      const exists = await Member.findOne({ memberId: memberId.trim() });
      if (!exists) {
        filter = { _id: memberId };
      }
    }

    const deletedMember = await Member.findOneAndDelete(filter);

    if (!deletedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.status(200).json({
      message: 'Member deleted successfully',
      data: deletedMember,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
