const express = require('express');

const router = express.Router();

const {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermissionStatus,
    downloadPermissionPDF,
    downloadPermissionAttachment,
} = require('../controllers/permissionController');

const {
    authenticateUser,
    authorizeRole,
} = require('../middleware/auth');

const permissionUpload = require('../middleware/permissionUpload');

// =====================================================
// CREATE PERMISSION REQUEST
// STUDENT ONLY
// =====================================================

router.post(
    '/',
    authenticateUser,
    authorizeRole('student'),
    permissionUpload.single('attachment'),
    createPermission
);

// =====================================================
// GET PERMISSION REQUESTS
// STUDENT / ADMIN / COORDINATOR
// =====================================================

router.get(
    '/',
    authenticateUser,
    authorizeRole(
        'student',
        'admin',
        'coordinator'
    ),
    getPermissions
);

// =====================================================
// GET SINGLE PERMISSION
// =====================================================

router.get(
    '/:id',
    authenticateUser,
    getPermissionById
);

// =====================================================
// DOWNLOAD GENERATED PERMISSION PDF
// =====================================================

router.get(
    '/:id/pdf',
    authenticateUser,
    downloadPermissionPDF
);

// =====================================================
// VIEW / DOWNLOAD SUPPORTING DOCUMENT
// =====================================================

router.get(
    '/:id/attachment',
    authenticateUser,
    downloadPermissionAttachment
);

// =====================================================
// APPROVE / REJECT PERMISSION
// COORDINATOR ONLY
// =====================================================

router.put(
    '/:id',
    authenticateUser,
    authorizeRole('coordinator'),
    updatePermissionStatus
);

module.exports = router;