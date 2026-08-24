const Coordinator = require('../models/Coordinator');
const User = require('../models/User');

/**
 * @desc    Get all authorized coordinators
 * @route   GET /api/coordinators
 * @access  Private (Admin only)
 */
const getCoordinators = async (req, res, next) => {
  try {
    const coordinators = await Coordinator.find().sort({ createdAt: -1 });
    return res.status(200).json({
      count: coordinators.length,
      coordinators,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Add / Whitelist a new coordinator
 * @route   POST /api/coordinators
 * @access  Private (Admin only)
 */
const createCoordinator = async (req, res, next) => {
  try {
    const { name, email, department } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: 'Coordinator name and email are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await Coordinator.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        message: 'Coordinator with this email already exists in whitelist',
      });
    }

    const coordinator = await Coordinator.create({
      name: name.trim(),
      email: normalizedEmail,
      department: department || 'Program Operations',
      isActive: true,
    });

    return res.status(201).json({
      message: 'Coordinator authorized and added to whitelist',
      coordinator,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update coordinator details / status
 * @route   PUT /api/coordinators/:id
 * @access  Private (Admin only)
 */
const updateCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coordinator = await Coordinator.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    return res.status(200).json({
      message: 'Coordinator updated successfully',
      coordinator,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Remove / Deactivate coordinator
 * @route   DELETE /api/coordinators/:id
 * @access  Private (Admin only)
 */
const deleteCoordinator = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coordinator = await Coordinator.findByIdAndDelete(id);
    if (!coordinator) {
      return res.status(404).json({ message: 'Coordinator not found' });
    }

    return res.status(200).json({
      message: 'Coordinator removed from authorization whitelist',
      data: coordinator,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
};
