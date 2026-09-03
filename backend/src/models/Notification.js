const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: ['Holiday', 'Event', 'Coding Contest', 'Mentor Meeting', 'Other'],
      default: 'Event',
    },
    fromDate: {
      type: Date,
      required: [true, 'From date is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'To date is required'],
    },
    time: {
      type: String,
      trim: true,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    sendTo: {
      type: String,
      default: 'All Members (81)',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    createdBy: {
      name: { type: String, default: 'Admin' },
      role: { type: String, default: 'admin' },
      email: { type: String, default: 'admin@c4gt.com' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
