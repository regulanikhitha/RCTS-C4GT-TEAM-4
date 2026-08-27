const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Coordinator name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Coordinator email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    department: {
      type: String,
      default: 'Program Operations',
      trim: true,
    },
    rollNo: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coordinator = mongoose.model('Coordinator', coordinatorSchema);

module.exports = Coordinator;
