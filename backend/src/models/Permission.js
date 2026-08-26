const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
    {
        // The user who submitted the permission request
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required'],
        },

        // Member information
        memberId: {
            type: String,
            required: [true, 'Member ID is required'],
            trim: true,
        },

        memberName: {
            type: String,
            required: [true, 'Member name is required'],
            trim: true,
        },

        memberEmail: {
            type: String,
            required: [true, 'Member email is required'],
            lowercase: true,
            trim: true,
        },

        role: {
            type: String,
            required: [true, 'Role is required'],
            enum: {
                values: ['student'],
                message: 'Only students can submit permission requests',
            },
            default: 'student',
        },

        // Permission details
        permissionType: {
            type: String,
            required: [true, 'Permission type is required'],
            trim: true,
        },

        fromDate: {
            type: Date,
            required: [true, 'From date is required'],
        },

        toDate: {
            type: Date,
            required: [true, 'To date is required'],
        },

        // full_day / half_day / specific_time
        durationType: {
            type: String,
            required: [true, 'Permission duration is required'],
            enum: {
                values: ['full_day', 'half_day', 'specific_time'],
                message:
                    'Duration must be full_day, half_day, or specific_time',
            },
        },

        fromTime: {
            type: String,
            default: null,
            trim: true,
        },

        toTime: {
            type: String,
            default: null,
            trim: true,
        },

        // Reason entered by the student
        reason: {
            type: String,
            required: [true, 'Reason for permission is required'],
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },

        // Supporting document information
        attachment: {
            originalName: {
                type: String,
                default: null,
            },

            fileName: {
                type: String,
                default: null,
            },

            filePath: {
                type: String,
                default: null,
            },

            mimeType: {
                type: String,
                default: null,
            },

            size: {
                type: Number,
                default: null,
            },
        },

        // Declaration checkbox
        declaration: {
            type: Boolean,
            required: [true, 'Declaration is required'],
            validate: {
                validator: (value) => value === true,
                message: 'Declaration must be accepted',
            },
        },

        // pending → approved / rejected
        status: {
            type: String,
            enum: {
                values: ['pending', 'approved', 'rejected'],
                message: 'Invalid permission status',
            },
            default: 'pending',
        },

        // Admin/coordinator review information
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },

        reviewedAt: {
            type: Date,
            default: null,
        },

        adminComment: {
            type: String,
            default: null,
            trim: true,
            maxlength: [500, 'Admin comment cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Make sure the end date is not before the start date
permissionSchema.pre('validate', function (next) {
    if (this.fromDate && this.toDate && this.toDate < this.fromDate) {
        this.invalidate(
            'toDate',
            'To date cannot be earlier than from date'
        );
    }

    next();
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;