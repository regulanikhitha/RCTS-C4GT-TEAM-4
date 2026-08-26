/**
 * Permission Request PDF Generator
 * Generates a PDF for a student permission request.
 */

const generatePermissionPDF = async (permission) => {
    const escapePdfText = (text) => {
        if (text === null || text === undefined) {
            return '';
        }

        return String(text)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');
    };

    const formatDate = (date) => {
        if (!date) {
            return '-';
        }

        return new Date(date).toLocaleDateString('en-IN');
    };

    const rows = [];

    // =====================================================
    // HEADER
    // =====================================================

    rows.push(
        'BT /F1 20 Tf 50 790 Td (C4GT HUB @KIET) Tj ET'
    );

    rows.push(
        'BT /F1 16 Tf 50 760 Td (PERMISSION REQUEST) Tj ET'
    );

    rows.push(
        `BT /F2 9 Tf 50 740 Td (Generated on: ${escapePdfText(
            new Date().toLocaleString('en-IN')
        )}) Tj ET`
    );

    // =====================================================
    // MEMBER DETAILS
    // =====================================================

    rows.push(
        'BT /F1 12 Tf 50 700 Td (MEMBER DETAILS) Tj ET'
    );

    rows.push(
        `BT /F2 10 Tf 60 675 Td (Name: ${escapePdfText(
            permission.memberName
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 655 Td (Member ID: ${escapePdfText(
            permission.memberId
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 635 Td (Role: ${escapePdfText(
            permission.role
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 615 Td (Email: ${escapePdfText(
            permission.memberEmail
        )}) Tj ET`
    );

    // =====================================================
    // PERMISSION DETAILS
    // =====================================================

    rows.push(
        'BT /F1 12 Tf 50 575 Td (PERMISSION DETAILS) Tj ET'
    );

    rows.push(
        `BT /F2 10 Tf 60 550 Td (Permission Type: ${escapePdfText(
            permission.permissionType
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 530 Td (From Date: ${escapePdfText(
            formatDate(permission.fromDate)
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 510 Td (To Date: ${escapePdfText(
            formatDate(permission.toDate)
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 490 Td (Duration: ${escapePdfText(
            permission.durationType
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 470 Td (From Time: ${escapePdfText(
            permission.fromTime || '-'
        )}) Tj ET`
    );

    rows.push(
        `BT /F2 10 Tf 60 450 Td (To Time: ${escapePdfText(
            permission.toTime || '-'
        )}) Tj ET`
    );

    // =====================================================
    // REASON
    // =====================================================

    rows.push(
        'BT /F1 12 Tf 50 410 Td (REASON) Tj ET'
    );

    const reason = escapePdfText(permission.reason || '-');

    rows.push(
        `BT /F2 10 Tf 60 385 Td (${reason.substring(
            0,
            90
        )}) Tj ET`
    );

    // =====================================================
    // DECLARATION
    // =====================================================

    rows.push(
        'BT /F1 12 Tf 50 335 Td (DECLARATION) Tj ET'
    );

    rows.push(
        `BT /F2 10 Tf 60 310 Td (Declaration Accepted: ${permission.declaration ? 'Yes' : 'No'
        }) Tj ET`
    );

    // =====================================================
    // STATUS
    // =====================================================

    rows.push(
        'BT /F1 12 Tf 50 270 Td (STATUS) Tj ET'
    );

    rows.push(
        `BT /F2 10 Tf 60 245 Td (Permission Status: ${escapePdfText(
            permission.status || 'pending'
        )}) Tj ET`
    );

    // =====================================================
    // FOOTER
    // =====================================================

    rows.push(
        'BT /F2 8 Tf 50 80 Td (C4GT HUB Attendance and Permission Management System) Tj ET'
    );

    rows.push(
        'BT /F2 8 Tf 50 65 Td (This document was generated automatically.) Tj ET'
    );

    const contentStream = rows.join('\n');

    const streamLength = Buffer.byteLength(
        contentStream,
        'utf8'
    );

    const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 842]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
/F2 6 0 R
>>
>>
>>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${contentStream}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000062 00000 n
0000000121 00000 n
0000000312 00000 n
0000000400 00000 n
0000000475 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
550
%%EOF`;

    return Buffer.from(pdf, 'utf8');
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
    generatePermissionPDF,
};