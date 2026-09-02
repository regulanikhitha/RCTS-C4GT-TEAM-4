/**
 * Native Multi-Page PDF Report Generator for C4GT Attendance
 * Constructs valid PDF 1.4 binary data containing:
 * - Clean modern header (No oversized white boxes)
 * - Concise single-line stats summary
 * - 5 Column Table: C4GT ID | TEAM NUMBER | NAME | ROLE | PRESENT OR ABSENT
 * - Multi-page pagination supporting all 81+ members
 */
const generateAttendancePDF = ({ date, stats, members = [] }) => {
  const escapePdfText = (text) => {
    if (text === null || text === undefined) return '';
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  };

  const ROW_HEIGHT = 15;
  const BOTTOM_MARGIN = 45;

  // First page starts table at 680, continuation pages at 715
  const page1StartY = 675;
  const otherPagesStartY = 715;

  const page1MaxRows = Math.floor((page1StartY - BOTTOM_MARGIN) / ROW_HEIGHT); // 42 rows
  const otherPagesMaxRows = Math.floor((otherPagesStartY - BOTTOM_MARGIN) / ROW_HEIGHT); // 44 rows

  const pagesData = [];
  const remaining = [...members];

  if (remaining.length === 0) {
    pagesData.push([]);
  } else {
    // Page 1
    pagesData.push(remaining.splice(0, page1MaxRows));
    // Additional pages
    while (remaining.length > 0) {
      pagesData.push(remaining.splice(0, otherPagesMaxRows));
    }
  }

  const totalPages = pagesData.length;
  const pageStreams = [];

  pagesData.forEach((pageMembers, pageIndex) => {
    const isFirstPage = pageIndex === 0;
    const pageNum = pageIndex + 1;
    const rows = [];

    if (isFirstPage) {
      // Header Banner (Navy / Teal accent)
      rows.push('0.06 0.46 0.43 rg 40 740 532 28 re f');
      rows.push('1 1 1 rg BT /F1 12 Tf 50 749 Td (C4GT HUB ATTENDANCE REPORT) Tj ET');
      rows.push(`1 1 1 rg BT /F2 8.5 Tf 425 749 Td (Date: ${escapePdfText(date)}) Tj ET`);

      // Summary line (compact, elegant, no big white box)
      const totalCount = stats?.totalMembers ?? members.length;
      const presentCount = stats?.present ?? members.filter((m) => m.status === 'Present').length;
      const absentCount = stats?.absent ?? members.filter((m) => m.status === 'Absent').length;
      const percentage = stats?.attendancePercentage ?? (totalCount ? Math.round((presentCount / totalCount) * 100) : 0);

      rows.push('0.96 0.97 0.99 rg 40 714 532 20 re f');
      rows.push('0.85 0.88 0.92 RG 40 714 532 20 re s');
      rows.push(`0.2 0.25 0.35 rg BT /F1 8 Tf 48 720 Td (SUMMARY:) Tj /F2 8 Tf 100 720 Td (Total Members: ${totalCount}   |   Present: ${presentCount}   |   Absent: ${absentCount}   |   Attendance: ${percentage}%) Tj ET`);

      // Table Header Row - Exactly 5 Headings
      const tableHeaderY = 692;
      rows.push('0.91 0.93 0.96 rg 40 ' + tableHeaderY + ' 532 16 re f');
      rows.push('0.78 0.82 0.88 RG 40 ' + tableHeaderY + ' 532 16 re s');
      rows.push('0.15 0.2 0.3 rg');
      rows.push('BT /F1 8 Tf 48 696 Td (C4GT ID) Tj ET');
      rows.push('BT /F1 8 Tf 125 696 Td (TEAM NUMBER) Tj ET');
      rows.push('BT /F1 8 Tf 210 696 Td (NAME) Tj ET');
      rows.push('BT /F1 8 Tf 365 696 Td (ROLE) Tj ET');
      rows.push('BT /F1 8 Tf 470 696 Td (PRESENT OR ABSENT) Tj ET');

      let currentY = tableHeaderY - ROW_HEIGHT;
      pageMembers.forEach((m, idx) => {
        if (idx % 2 === 1) {
          rows.push(`0.97 0.98 0.99 rg 40 ${currentY - 2} 532 ${ROW_HEIGHT} re f`);
        }
        rows.push(`0.92 0.93 0.95 RG 40 ${currentY - 2} 532 0.5 re s`);

        const memberId = m.memberId || m.customId || `C4GT-${String(idx + 1).padStart(3, '0')}`;
        const team = m.team || '—';
        const name = (m.name || 'Unknown').substring(0, 26);
        const role = m.role || '—';
        const status = m.status || 'Unmarked';

        rows.push(`0.15 0.2 0.3 rg BT /F2 7.5 Tf 48 ${currentY + 2} Td (${escapePdfText(memberId)}) Tj ET`);
        rows.push(`0.06 0.46 0.43 rg BT /F1 7.5 Tf 125 ${currentY + 2} Td (${escapePdfText(team)}) Tj ET`);
        rows.push(`0.1 0.1 0.15 rg BT /F2 7.5 Tf 210 ${currentY + 2} Td (${escapePdfText(name)}) Tj ET`);
        rows.push(`0.3 0.35 0.4 rg BT /F2 7.5 Tf 365 ${currentY + 2} Td (${escapePdfText(role)}) Tj ET`);

        if (status === 'Present') {
          rows.push(`0 0.5 0.2 rg BT /F1 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        } else if (status === 'Absent') {
          rows.push(`0.85 0.15 0.15 rg BT /F1 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        } else {
          rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        }

        currentY -= ROW_HEIGHT;
      });

      // Footer
      rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 40 20 Td (Page ${pageNum} of ${totalPages}) Tj ET`);
      rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 440 20 Td (Generated: ${escapePdfText(new Date().toLocaleDateString('en-IN'))}) Tj ET`);
    } else {
      // Continuation page header
      rows.push('0.06 0.46 0.43 rg 40 750 532 20 re f');
      rows.push(`1 1 1 rg BT /F1 9.5 Tf 50 756 Td (C4GT HUB ATTENDANCE REPORT — Page ${pageNum} of ${totalPages}) Tj ET`);
      rows.push(`1 1 1 rg BT /F2 8 Tf 445 756 Td (Date: ${escapePdfText(date)}) Tj ET`);

      // Table Header Row
      const tableHeaderY = 728;
      rows.push('0.91 0.93 0.96 rg 40 ' + tableHeaderY + ' 532 16 re f');
      rows.push('0.78 0.82 0.88 RG 40 ' + tableHeaderY + ' 532 16 re s');
      rows.push('0.15 0.2 0.3 rg');
      rows.push('BT /F1 8 Tf 48 732 Td (C4GT ID) Tj ET');
      rows.push('BT /F1 8 Tf 125 732 Td (TEAM NUMBER) Tj ET');
      rows.push('BT /F1 8 Tf 210 732 Td (NAME) Tj ET');
      rows.push('BT /F1 8 Tf 365 732 Td (ROLE) Tj ET');
      rows.push('BT /F1 8 Tf 470 732 Td (PRESENT OR ABSENT) Tj ET');

      let currentY = tableHeaderY - ROW_HEIGHT;
      pageMembers.forEach((m, idx) => {
        if (idx % 2 === 1) {
          rows.push(`0.97 0.98 0.99 rg 40 ${currentY - 2} 532 ${ROW_HEIGHT} re f`);
        }
        rows.push(`0.92 0.93 0.95 RG 40 ${currentY - 2} 532 0.5 re s`);

        const memberId = m.memberId || m.customId || `C4GT-${String(idx + 1).padStart(3, '0')}`;
        const team = m.team || '—';
        const name = (m.name || 'Unknown').substring(0, 26);
        const role = m.role || '—';
        const status = m.status || 'Unmarked';

        rows.push(`0.15 0.2 0.3 rg BT /F2 7.5 Tf 48 ${currentY + 2} Td (${escapePdfText(memberId)}) Tj ET`);
        rows.push(`0.06 0.46 0.43 rg BT /F1 7.5 Tf 125 ${currentY + 2} Td (${escapePdfText(team)}) Tj ET`);
        rows.push(`0.1 0.1 0.15 rg BT /F2 7.5 Tf 210 ${currentY + 2} Td (${escapePdfText(name)}) Tj ET`);
        rows.push(`0.3 0.35 0.4 rg BT /F2 7.5 Tf 365 ${currentY + 2} Td (${escapePdfText(role)}) Tj ET`);

        if (status === 'Present') {
          rows.push(`0 0.5 0.2 rg BT /F1 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        } else if (status === 'Absent') {
          rows.push(`0.85 0.15 0.15 rg BT /F1 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        } else {
          rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 470 ${currentY + 2} Td (${escapePdfText(status)}) Tj ET`);
        }

        currentY -= ROW_HEIGHT;
      });

      // Footer
      rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 40 20 Td (Page ${pageNum} of ${totalPages}) Tj ET`);
      rows.push(`0.5 0.5 0.5 rg BT /F2 7.5 Tf 440 20 Td (Generated: ${escapePdfText(new Date().toLocaleDateString('en-IN'))}) Tj ET`);
    }

    pageStreams.push(rows.join('\n'));
  });

  // Construct PDF 1.4 Binary with valid Object IDs & exact byte offsets
  // Obj 1: Catalog
  // Obj 2: Pages (Kids array)
  // For each page i (0 to totalPages-1):
  //   Page Obj: 3 + 2*i
  //   Content Stream Obj: 4 + 2*i
  // Font F1 (Bold): 3 + 2*totalPages
  // Font F2 (Regular): 4 + 2*totalPages
  const fontBoldObjId = 3 + 2 * totalPages;
  const fontRegularObjId = 4 + 2 * totalPages;
  const totalObjects = 4 + 2 * totalPages; // 1..totalObjects

  const kids = [];
  for (let i = 0; i < totalPages; i++) {
    kids.push(`${3 + 2 * i} 0 R`);
  }

  const objects = [];

  // 1 0 obj: Catalog
  objects.push({
    id: 1,
    content: `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`,
  });

  // 2 0 obj: Pages
  objects.push({
    id: 2,
    content: `2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${totalPages} >>\nendobj`,
  });

  // Page and Stream objects
  for (let i = 0; i < totalPages; i++) {
    const pageObjId = 3 + 2 * i;
    const streamObjId = 4 + 2 * i;
    const streamContent = pageStreams[i];
    const streamLength = Buffer.byteLength(streamContent, 'utf8');

    objects.push({
      id: pageObjId,
      content: `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${streamObjId} 0 R /Resources << /Font << /F1 ${fontBoldObjId} 0 R /F2 ${fontRegularObjId} 0 R >> >> >>\nendobj`,
    });

    objects.push({
      id: streamObjId,
      content: `${streamObjId} 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`,
    });
  }

  // Fonts
  objects.push({
    id: fontBoldObjId,
    content: `${fontBoldObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`,
  });

  objects.push({
    id: fontRegularObjId,
    content: `${fontRegularObjId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`,
  });

  // Build the complete PDF buffer
  let pdfString = '%PDF-1.4\n';
  const offsets = [0]; // offset for obj 0 is 0

  objects.forEach((obj) => {
    offsets[obj.id] = Buffer.byteLength(pdfString, 'utf8');
    pdfString += obj.content + '\n';
  });

  const xrefOffset = Buffer.byteLength(pdfString, 'utf8');
  let xref = `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;

  for (let id = 1; id <= totalObjects; id++) {
    const offset = offsets[id] || 0;
    xref += String(offset).padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  pdfString += xref + trailer;

  return Buffer.from(pdfString, 'utf8');
};

module.exports = {
  generateAttendancePDF,
};
