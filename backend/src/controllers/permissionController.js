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
        const user = req.user;
        let query = {};
        if (user && user.role === 'student') {
            query = {
                $or: [
                    { user: user._id },
                    { memberEmail: user.email?.toLowerCase().trim() },
                    { memberId: user.memberId },
                ].filter(Boolean),
            };
        }

        const permissions = await Permission.find(query)
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
// UPDATE PERMISSION STATUS (APPROVE / REJECT)
// PUT /api/permissions/:id
// =====================================================

const updatePermissionStatus = async (req, res, next) => {
    try {
        const { status, adminComment } = req.body;

        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({
                message: 'Status must be pending, approved, or rejected.',
            });
        }

        const permission = await Permission.findById(req.params.id);
        if (!permission) {
            return res.status(404).json({
                message: 'Permission request not found.',
            });
        }

        permission.status = status;
        if (adminComment !== undefined) {
            permission.adminComment = adminComment;
        }
        permission.reviewedBy = req.user._id;
        permission.reviewedAt = new Date();

        await permission.save();

        return res.status(200).json({
            message: `Permission request ${status} successfully.`,
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
    updatePermissionStatus,
};