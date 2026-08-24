const mongoose = require('mongoose');
const Member = require('../models/Member');

/**
 * @desc    Get all members (supports optional ?role= query filter)
 * @route   GET /api/members
 * @access  Public
 */
const getMembers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};

    if (role) {
      filter.role = role.toLowerCase();
    }

    const members = await Member.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(members);
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get single member by ID
 * @route   GET /api/members/:id
 * @access  Public
 */
const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const member = await Member.findById(id);
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
 * @access  Public
 */
const createMember = async (req, res, next) => {
  try {
    const { name, email, role, team, joinDate, status } = req.body;

    const newMember = new Member({
      name,
      email,
      role,
      team,
      joinDate,
      status,
    });

    const savedMember = await newMember.save();
    return res.status(201).json(savedMember);
  } catch (error) {
    // Handle duplicate email (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email already exists. Please provide a unique email address.',
      });
    }

    // Handle Mongoose validation errors
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
 * @desc    Update a member (PUT/PATCH)
 * @route   PUT /api/members/:id or PATCH /api/members/:id
 * @access  Public
 */
const updateMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const updatedMember = await Member.findByIdAndUpdate(
      id,
      { $set: req.body },
      {
        new: true, // Return updated document
        runValidators: true, // Ensure validations like enum and regex run on update
        context: 'query',
      }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.status(200).json(updatedMember);
  } catch (error) {
    // Handle duplicate email (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email already exists. Please provide a unique email address.',
      });
    }

    // Handle Mongoose validation errors (e.g. invalid role enum, bad email format)
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
 * @route   DELETE /api/members/:id
 * @access  Public
 */
const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Member not found' });
    }

    const deletedMember = await Member.findByIdAndDelete(id);

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
