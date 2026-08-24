const express = require('express');
const router = express.Router();
const {
  getCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
} = require('../controllers/coordinatorController');
const { authenticateUser, authorizeRole } = require('../middleware/auth');

// All coordinator routes require Admin role
router.use(authenticateUser, authorizeRole('admin'));

router.route('/').get(getCoordinators).post(createCoordinator);

router.route('/:id').put(updateCoordinator).delete(deleteCoordinator);

module.exports = router;
