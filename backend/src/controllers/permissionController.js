const Permission = require('../models/Permission');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

/*
|--------------------------------------------------------------------------
| CREATE PERMISSION
|--------------------------------------------------------------------------
*/
const createPermission = async (req, res) => {
    try {
        const {
            permissionType,
            fromDate,
            toDate,
            durationType,
            fromTime,
            toTime,
            reason,
            declaration,
        } = req.body;

        if (!req.user) {
            return res.status(401).json({
                message: 'Authentication required.',
            });
        }

        if (req.user.role !== 'student') {
            return res.status(403).json({
                message: 'Only students can submit permission requests.',
            });
        }

        if (declaration !== true && declaration !== 'true') {
            return res.status(400).json({
                message: 'You must accept the declaration.',
            });
        }

        const permission = new Permission({
            user: req.user._id,

            memberId:
                req.user.memberId ||
                req.user.rollNo ||
                'N/A',

            memberName: req.user.name,

            memberEmail: req.user.email,

            role: 'student',

            permissionType,

            fromDate,

            toDate,

            durationType,

            fromTime: fromTime || null,

            toTime: toTime || null,

            reason,

            declaration: true,

            adminStatus: 'pending',

            coordinatorStatus: 'pending',

            status: 'pending',

            attachment: req.file
                ? {
                    originalName:
                        req.file.originalname,

                    fileName:
                        req.file.filename,

                    filePath:
                        req.file.path,

                    mimeType:
                        req.file.mimetype,

                    size:
                        req.file.size,
                }
                : null,
        });

        await permission.save();

        return res.status(201).json({
            success: true,
            message:
                'Permission request submitted successfully!',
            permission,
        });
    } catch (error) {
        console.error(
            'Create permission error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to submit permission request.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET PERMISSIONS
|--------------------------------------------------------------------------
*/
const getPermissions = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'student') {
            filter = {
                user: req.user._id,
            };
        }

        const permissions = await Permission.find(filter)
            .populate(
                'user',
                'name email memberId rollNo'
            )
            .populate(
                'adminReviewedBy',
                'name email role'
            )
            .populate(
                'coordinatorReviewedBy',
                'name email role'
            )
            .sort({
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            permissions,
        });
    } catch (error) {
        console.error(
            'Get permissions error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to fetch permissions.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| GET SINGLE PERMISSION
|--------------------------------------------------------------------------
*/
const getPermissionById = async (req, res) => {
    try {
        const permission =
            await Permission.findById(req.params.id)
                .populate(
                    'user',
                    'name email memberId rollNo'
                )
                .populate(
                    'adminReviewedBy',
                    'name email role'
                )
                .populate(
                    'coordinatorReviewedBy',
                    'name email role'
                );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    'Permission request not found.',
            });
        }

        if (
            req.user.role === 'student' &&
            permission.user._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not allowed to view this request.',
            });
        }

        return res.status(200).json({
            success: true,
            permission,
        });
    } catch (error) {
        console.error(
            'Get permission by ID error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to fetch permission request.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| UPDATE ADMIN / COORDINATOR STATUS
|--------------------------------------------------------------------------
*/
const updatePermissionStatus = async (
    req,
    res
) => {
    try {
        const {
            status,
            adminComment,
        } = req.body;

        // ==========================================================
        // BACKEND SAFETY: ONLY COORDINATOR CAN APPROVE / REJECT
        // ==========================================================

        if (req.user.role !== 'coordinator') {
            return res.status(403).json({
                success: false,
                message:
                    'Only coordinator can approve or reject permission requests.',
            });
        }

        if (
            !['approved', 'rejected'].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Status must be approved or rejected.',
            });
        }

        // ==========================================================
        // FIND ONLY THE REQUESTED PERMISSION BY ID
        // ==========================================================

        const permission =
            await Permission.findById(
                req.params.id
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    'Permission request not found.',
            });
        }

        // ==========================================================
        // COORDINATOR REVIEW — UPDATE ONLY THIS DOCUMENT
        // ==========================================================

        permission.coordinatorStatus =
            status;

        permission.coordinatorReviewedBy =
            req.user._id;

        permission.coordinatorReviewedAt =
            new Date();

        // ==========================================================
        // FINAL / OVERALL STATUS
        //
        // Coordinator is the sole decision-maker.
        // adminStatus remains 'pending' (admin cannot modify it).
        //
        // Coordinator approves -> overall approved
        // Coordinator rejects  -> overall rejected
        // Otherwise            -> overall pending
        // ==========================================================

        if (status === 'approved') {
            permission.status = 'approved';
        } else if (status === 'rejected') {
            permission.status = 'rejected';
        } else {
            permission.status = 'pending';
        }

        // ==========================================================
        // STORE OPTIONAL COMMENT
        // ==========================================================

        if (adminComment) {
            permission.adminComment =
                adminComment;
        }

        // ==========================================================
        // COMPATIBILITY FIELDS
        // ==========================================================

        permission.reviewedBy =
            req.user._id;

        permission.reviewedAt =
            new Date();

        await permission.save();

        return res.status(200).json({
            success: true,
            message:
                `Permission request ${status} successfully.`,
            permission,
        });
    } catch (error) {
        console.error(
            'Update permission status error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to update permission status.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| DOWNLOAD / VIEW GENERATED PERMISSION PDF
|--------------------------------------------------------------------------
*/
const downloadPermissionPDF = async (
    req,
    res
) => {
    try {
        const permission =
            await Permission.findById(
                req.params.id
            ).populate(
                'user',
                'name email memberId rollNo'
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    'Permission request not found.',
            });
        }

        if (
            req.user.role === 'student' &&
            permission.user._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not allowed to view this PDF.',
            });
        }

        res.setHeader(
            'Content-Type',
            'application/pdf'
        );

        res.setHeader(
            'Content-Disposition',
            `inline; filename="permission-${permission._id}.pdf"`
        );

        const doc =
            new PDFDocument();

        doc.pipe(res);

        doc.fontSize(20)
            .text(
                'Permission Request',
                {
                    align: 'center',
                }
            );

        doc.moveDown();

        doc.fontSize(12);

        doc.text(
            `Student Name: ${permission.memberName}`
        );

        doc.text(
            `Member ID: ${permission.memberId}`
        );

        doc.text(
            `Email: ${permission.memberEmail}`
        );

        doc.moveDown();

        doc.text(
            `Permission Type: ${permission.permissionType}`
        );

        doc.text(
            `From Date: ${new Date(
                permission.fromDate
            ).toLocaleDateString()}`
        );

        doc.text(
            `To Date: ${new Date(
                permission.toDate
            ).toLocaleDateString()}`
        );

        doc.text(
            `Duration: ${permission.durationType}`
        );

        if (permission.fromTime) {
            doc.text(
                `From Time: ${permission.fromTime}`
            );
        }

        if (permission.toTime) {
            doc.text(
                `To Time: ${permission.toTime}`
            );
        }

        doc.moveDown();

        doc.text(
            'Reason:',
            {
                underline: true,
            }
        );

        doc.text(
            permission.reason
        );

        doc.moveDown();

        doc.text(
            `Admin Status: ${permission.adminStatus ||
            'pending'
            }`
        );

        doc.text(
            `Coordinator Status: ${permission.coordinatorStatus ||
            'pending'
            }`
        );

        doc.text(
            `Overall Status: ${permission.status ||
            'pending'
            }`
        );

        doc.moveDown();

        doc.text(
            `Submitted On: ${new Date(
                permission.createdAt
            ).toLocaleString()}`
        );

        doc.end();
    } catch (error) {
        console.error(
            'Download permission PDF error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to generate permission PDF.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| VIEW UPLOADED SUPPORTING DOCUMENT
|--------------------------------------------------------------------------
*/
const downloadPermissionAttachment = async (
    req,
    res
) => {
    try {
        const permission =
            await Permission.findById(
                req.params.id
            );

        if (!permission) {
            return res.status(404).json({
                success: false,
                message:
                    'Permission request not found.',
            });
        }

        if (
            req.user.role === 'student' &&
            permission.user.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    'You are not allowed to view this document.',
            });
        }

        if (
            !permission.attachment ||
            !permission.attachment.filePath
        ) {
            return res.status(404).json({
                success: false,
                message:
                    'No supporting document was uploaded.',
            });
        }

        const filePath =
            permission.attachment.filePath;

        if (
            !fs.existsSync(filePath)
        ) {
            return res.status(404).json({
                success: false,
                message:
                    'Uploaded document could not be found on the server.',
            });
        }

        res.setHeader(
            'Content-Type',
            permission.attachment.mimeType ||
            'application/octet-stream'
        );

        res.setHeader(
            'Content-Disposition',
            `inline; filename="${permission.attachment.originalName}"`
        );

        return res.sendFile(
            path.resolve(filePath)
        );
    } catch (error) {
        console.error(
            'Download attachment error:',
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to open supporting document.',
        });
    }
};


/*
|--------------------------------------------------------------------------
| EXPORTS
|--------------------------------------------------------------------------
*/
module.exports = {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermissionStatus,
    downloadPermissionPDF,
    downloadPermissionAttachment,
};