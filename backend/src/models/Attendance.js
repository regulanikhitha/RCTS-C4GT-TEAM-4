const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: [true, 'Member ID is required'],
      trim: true,
      ref: 'Member',
    },
    date: {
      type: String,
      required: [true, 'Date is required (YYYY-MM-DD)'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Attendance status is required'],
      enum: {
        values: ['Present', 'Absent'],
        message: '{VALUE} is not a valid status. Allowed values: Present, Absent',
      },
    },
    markedTime: {
      type: Date,
      default: Date.now,
    },
    markedBy: {
      type: String,
      required: [true, 'markedBy (coordinator ID/email) is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound constraint: a member cannot receive multiple attendance records for the same date
attendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
