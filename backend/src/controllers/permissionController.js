const Permission = require('../models/Permission');
const { generatePermissionPDF } = require('../utils/permissionPdf');

// =====================================================
// CREATE PERMISSION REQUEST
// POST /api/permissions
// =====================================================

const createPermission = async (req, res, next) => {
    try {
        const {
            permissionType,
            fromDate,
            toDate,
            durationType,
            fromTime,
            toTime,
            reason,
            attachment,
            declaration,
        } = req.body;

        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: 'Authentication required.',
            });
        }

        if (user.role !== 'student') {
            return res.status(403).json({
                message: 'Only students can submit permission requests.',
            });
        }

        // Save permission request to MongoDB
        const permission = await Permission.create({
            user: user._id,
            memberId: user.memberId,
            memberName: user.name,
            memberEmail: user.email,
            role: user.role,

            permissionType,
            fromDate,
            toDate,
            durationType,
            fromTime: fromTime || null,
            toTime: toTime || null,
            reason,
            attachment: attachment || undefined,
            declaration,
        });

        // Generate permission PDF
        const pdf = await generatePermissionPDF(permission);

        return res.status(201).json({
            message: 'Permission request submitted successfully.',
            permission,
            pdf,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET ALL PERMISSION REQUESTS
// GET /api/permissions
// =====================================================

const getPermissions = async (req, res, next) => {
    try {
        const permissions = await Permission.find()
            .populate('user', 'name email role memberId')
            .populate('reviewedBy', 'name email role')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: permissions.length,
            permissions,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// GET ONE PERMISSION REQUEST
// GET /api/permissions/:id
// =====================================================

const getPermissionById = async (req, res, next) => {
    try {
        const permission = await Permission.findById(req.params.id)
            .populate('user', 'name email role memberId')
            .populate('reviewedBy', 'name email role');

        if (!permission) {
            return res.status(404).json({
                message: 'Permission request not found.',
            });
        }

        return res.status(200).json({
            permission,
        });

    } catch (error) {
        next(error);
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    createPermission,
    getPermissions,
    getPermissionById,
};