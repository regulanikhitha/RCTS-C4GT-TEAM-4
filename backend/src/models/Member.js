const mongoose = require('mongoose');

// Regular expression for validating standard email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Member Schema Definition
 * Represents a member/student in the C4GT Hub Attendance system.
 */
const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address'],
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['junior', 'senior', 'lead'],
        message: '{VALUE} is not a valid role. Allowed roles: junior, senior, lead',
      },
      lowercase: true,
      trim: true,
    },
    team: {
      type: String,
      required: [true, 'Team is required'],
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive'],
        message: '{VALUE} is not a valid status. Allowed values: active, inactive',
      },
      default: 'active',
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
