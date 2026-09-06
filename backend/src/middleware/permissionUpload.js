const multer = require('multer');
const path = require('path');
const fs = require('fs');

// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
    __dirname,
    '../../uploads/permissions'
);

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

// =====================================================
// STORAGE CONFIGURATION
// =====================================================

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = path.extname(
            file.originalname
        );

        const originalName = path.basename(
            file.originalname,
            extension
        );

        const safeName = originalName.replace(
            /[^a-zA-Z0-9-_]/g,
            '_'
        );

        const uniqueName =
            `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}-${safeName}${extension}`;

        cb(null, uniqueName);
    },
});

// =====================================================
// FILE TYPE VALIDATION
// =====================================================

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ];

    if (
        allowedMimeTypes.includes(
            file.mimetype
        )
    ) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Only PDF, JPG and PNG files are allowed.'
            )
        );
    }
};

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const permissionUpload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },

    fileFilter,
});

// =====================================================
// EXPORT
// =====================================================

module.exports = permissionUpload;