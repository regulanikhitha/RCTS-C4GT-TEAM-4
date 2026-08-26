const express = require('express');

const router = express.Router();

const {
    createPermission,
    getPermissions,
    getPermissionById,
} = require('../controllers/permissionController');

const {
    authenticateUser,
    authorizeRole,
} = require('../middleware/auth');

console.log('CREATE:', typeof createPermission);
console.log('AUTH:', typeof authenticateUser);
console.log('ROLE:', typeof authorizeRole);

// =====================================================
// STUDENT: CREATE PERMISSION REQUEST
// POST /api/permissions
// =====================================================

router.post(
    '/',
    authenticateUser,
    authorizeRole('student'),
    createPermission
);

// =====================================================
// ADMIN / COORDINATOR: VIEW ALL PERMISSION REQUESTS
// GET /api/permissions
// =====================================================

router.get(
    '/',
    authenticateUser,
    authorizeRole('admin', 'coordinator'),
    getPermissions
);

// =====================================================
// AUTHENTICATED USER: VIEW ONE PERMISSION REQUEST
// GET /api/permissions/:id
// =====================================================

router.get(
    '/:id',
    authenticateUser,
    getPermissionById
);

module.exports = router;