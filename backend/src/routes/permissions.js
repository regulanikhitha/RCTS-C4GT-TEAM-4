const express = require('express');

const router = express.Router();

const {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermissionStatus,
} = require('../controllers/permissionController');

const {
    authenticateUser,
    authorizeRole,
} = require('../middleware/auth');

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
// GET PERMISSION REQUESTS
// GET /api/permissions
// (Students get their own; Admins/Coordinators get all)
// =====================================================

router.get(
    '/',
    authenticateUser,
    getPermissions
);

// =====================================================
// ADMIN / COORDINATOR: UPDATE PERMISSION STATUS
// PUT /api/permissions/:id
// =====================================================

router.put(
    '/:id/status',
    authenticateUser,
    authorizeRole('admin', 'coordinator'),
    updatePermissionStatus
);

router.put(
    '/:id',
    authenticateUser,
    authorizeRole('admin', 'coordinator'),
    updatePermissionStatus
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