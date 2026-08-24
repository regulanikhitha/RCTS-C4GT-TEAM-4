/**
 * Native PDF Report Generator for C4GT Attendance
 * Constructs valid PDF 1.4 binary data containing title, metadata, stats summary, and member table.
 */
const generateAttendancePDF = ({ date, stats, members }) => {
  const escapePdfText = (text) => {
    if (text === null || text === undefined) return '';
    return String(text).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  };

  const rows = [];

  // Header & Title
  rows.push('BT /F1 18 Tf 50 780 Td (C4GT HUB ATTENDANCE REPORT) Tj ET');
  rows.push(`BT /F2 10 Tf 50 762 Td (Date: ${escapePdfText(date)}  |  Generated At: ${escapePdfText(new Date().toISOString())}) Tj ET`);

  // Summary Statistics Box
  rows.push('0.9 0.9 0.95 rg 45 680 520 65 re f');
  rows.push('0.2 0.2 0.5 RG 45 680 520 65 re s');
  rows.push(`BT /F1 11 Tf 55 725 Td (ATTENDANCE SUMMARY) Tj ET`);
  rows.push(`BT /F2 9 Tf 55 708 Td (Total Members: ${stats.totalMembers}   |   Present: ${stats.present}   |   Absent: ${stats.absent}   |   Percentage: ${stats.attendancePercentage}%) Tj ET`);
  if (stats.roleStats) {
    const junior = stats.roleStats.juniorDevelopers || { total: 0, present: 0, absent: 0 };
    const senior = stats.roleStats.seniorDevelopers || { total: 0, present: 0, absent: 0 };
    rows.push(`BT /F2 8.5 Tf 55 690 Td (Junior Devs: Total ${junior.total}, Present ${junior.present}, Absent ${junior.absent}  |  Senior Devs: Total ${senior.total}, Present ${senior.present}, Absent ${senior.absent}) Tj ET`);
  }

  // Table Headers
  let y = 650;
  rows.push('0.85 0.88 0.92 rg 45 640 520 18 re f');
  rows.push('BT /F1 9 Tf 50 645 Td (MEMBER ID) Tj ET');
  rows.push('BT /F1 9 Tf 130 645 Td (MEMBER NAME) Tj ET');
  rows.push('BT /F1 9 Tf 280 645 Td (ROLE) Tj ET');
  rows.push('BT /F1 9 Tf 400 645 Td (STATUS) Tj ET');
  rows.push('BT /F1 9 Tf 470 645 Td (MARKED TIME) Tj ET');

  // Member Rows
  y = 625;
  members.forEach((m, idx) => {
    if (y < 45) {
      // For compact reporting on long lists, keep item line height clean
      return;
    }

    if (idx % 2 === 1) {
      rows.push(`0.97 0.97 0.97 rg 45 ${y - 4} 520 14 re f`);
    }

    const memberId = m.memberId || m.customId || `C4GT-${String(idx + 1).padStart(3, '0')}`;
    const name = m.name || (m.member && m.member.name) || 'Unknown';
    const role = m.role || (m.member && m.member.role) || '-';
    const status = m.status || 'Unmarked';
    const markedTime = m.markedTime ? new Date(m.markedTime).toLocaleTimeString() : '-';

    // Status color hint
    if (status === 'Present') {
      rows.push('0 0.5 0.1 rg'); // Green
    } else if (status === 'Absent') {
      rows.push('0.8 0.1 0.1 rg'); // Red
    } else {
      rows.push('0.4 0.4 0.4 rg'); // Gray
    }

    rows.push(`BT /F2 8 Tf 50 ${y} Td (${escapePdfText(memberId)}) Tj ET`);
    rows.push(`BT /F2 8 Tf 130 ${y} Td (${escapePdfText(name.substring(0, 26))}) Tj ET`);
    rows.push(`BT /F2 8 Tf 280 ${y} Td (${escapePdfText(role)}) Tj ET`);
    rows.push(`BT /F1 8 Tf 400 ${y} Td (${escapePdfText(status)}) Tj ET`);
    rows.push(`0 0 0 rg BT /F2 7.5 Tf 470 ${y} Td (${escapePdfText(markedTime)}) Tj ET`);

    y -= 15;
  });

  const contentStream = rows.join('\n');
  const streamLength = Buffer.byteLength(contentStream, 'utf8');

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
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
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000300 00000 n 
0000000378 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
450
%%EOF`;

  return Buffer.from(pdf, 'utf8');
};

module.exports = {
  generateAttendancePDF,
};
