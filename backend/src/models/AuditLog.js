const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    attendanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attendance',
      default: null,
    },
    memberId: {
      type: String,
      required: [true, 'Member ID is required'],
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: ['CREATE', 'UPDATE', 'DELETE'],
    },
    oldStatus: {
      type: String,
      default: null,
    },
    newStatus: {
      type: String,
      required: [true, 'New status is required'],
    },
    performedBy: {
      type: String,
      required: [true, 'performedBy is required'],
      trim: true,
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
