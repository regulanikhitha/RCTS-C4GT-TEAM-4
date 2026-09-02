const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const AuditLog = require('../models/AuditLog');
const { generateAttendancePDF } = require('../utils/pdfGenerator');

/**
 * @desc    Mark attendance for a single member
 * @route   POST /api/attendance
 * @access  Private (Admin & Coordinator)
 */
const markAttendance = async (req, res, next) => {
  try {
    const { memberId, date, status } = req.body;

    if (!memberId || !date || !status) {
      return res.status(400).json({
        message: 'memberId, date (YYYY-MM-DD), and status (Present/Absent) are required',
      });
    }

    // Verify member exists and is active
    const member = await Member.findOne({ memberId: memberId.trim() });
    if (!member) {
      return res.status(404).json({ message: `Member ${memberId} not found` });
    }
    if (!member.isActive) {
      return res.status(400).json({ message: `Cannot mark attendance for inactive member: ${memberId}` });
    }

    const markedBy = req.user ? req.user.email : 'System';

    // Create attendance record
    const attendance = await Attendance.create({
      memberId: member.memberId,
      date: date.trim(),
      status,
      markedTime: new Date(),
      markedBy,
    });

    // Write to AuditLog
    await AuditLog.create({
      attendanceId: attendance._id,
      memberId: member.memberId,
      action: 'CREATE',
      oldStatus: null,
      newStatus: status,
      performedBy: markedBy,
      performedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: `Attendance for member on date ${req.body.date} has already been marked. Use PUT to update.`,
      });
    }
    return next(error);
  }
};

/**
 * @desc    Mark bulk attendance for multiple members
 * @route   POST /api/attendance/bulk
 * @access  Private (Admin & Coordinator)
 */
const markBulkAttendance = async (req, res, next) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: 'date (YYYY-MM-DD) and a non-empty records array [{ memberId, status }] are required',
      });
    }

    const markedBy = req.user ? req.user.email : 'System';
    const results = [];
    const errors = [];

    for (const rec of records) {
      try {
        const member = await Member.findOne({ memberId: rec.memberId.trim(), isActive: true });
        if (!member) {
          errors.push({ memberId: rec.memberId, error: 'Member not found or inactive' });
          continue;
        }

        const existing = await Attendance.findOne({ memberId: member.memberId, date: date.trim() });
        if (existing) {
          // Update existing
          const oldStatus = existing.status;
          existing.status = rec.status;
          existing.markedTime = new Date();
          existing.markedBy = markedBy;
          await existing.save();

          await AuditLog.create({
            attendanceId: existing._id,
            memberId: member.memberId,
            action: 'UPDATE',
            oldStatus,
            newStatus: rec.status,
            performedBy: markedBy,
          });

          results.push(existing);
        } else {
          // Create new
          const created = await Attendance.create({
            memberId: member.memberId,
            date: date.trim(),
            status: rec.status,
            markedTime: new Date(),
            markedBy,
          });

          await AuditLog.create({
            attendanceId: created._id,
            memberId: member.memberId,
            action: 'CREATE',
            oldStatus: null,
            newStatus: rec.status,
            performedBy: markedBy,
          });

          results.push(created);
        }
      } catch (err) {
        errors.push({ memberId: rec.memberId, error: err.message });
      }
    }

    return res.status(200).json({
      message: `Bulk attendance processed: ${results.length} saved, ${errors.length} failed.`,
      date,
      count: results.length,
      results,
      errors,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Update an existing attendance record
 * @route   PUT /api/attendance/:attendanceId
 * @access  Private (Admin & Coordinator)
 */
const updateAttendance = async (req, res, next) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;

    if (!status || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        message: 'Status is required and must be either "Present" or "Absent"',
      });
    }

    let attendance = null;
    if (mongoose.Types.ObjectId.isValid(attendanceId)) {
      attendance = await Attendance.findById(attendanceId);
    }

    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    const oldStatus = attendance.status;
    const performedBy = req.user ? req.user.email : 'System';

    attendance.status = status;
    attendance.markedTime = new Date();
    attendance.markedBy = performedBy;
    const updated = await attendance.save();

    // Write audit log
    await AuditLog.create({
      attendanceId: attendance._id,
      memberId: attendance.memberId,
      action: 'UPDATE',
      oldStatus,
      newStatus: status,
      performedBy,
      performedAt: new Date(),
    });

    return res.status(200).json({
      message: 'Attendance record updated successfully',
      attendance: updated,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get daily attendance for all members (supports ?date= & ?role=)
 * @route   GET /api/attendance
 * @access  Private (Admin & Coordinator)
 */
const getDailyAttendance = async (req, res, next) => {
  try {
    const date =
  req.query.date ||
  new Date().toISOString().split('T')[0];

const { role, team } = req.query;

const memberFilter = {
  isActive: true,
};

// Role filter
if (role) {
  const r = role.trim();
  if (/^lead/i.test(r)) {
    memberFilter.$or = [
      { role: new RegExp('^lead', 'i') },
      { department: new RegExp('lead', 'i') },
    ];
  } else if (/^senior/i.test(r) || /^sd$/i.test(r)) {
    memberFilter.role = new RegExp('^senior', 'i');
    memberFilter.department = { $not: /lead/i };
  } else if (/^junior/i.test(r) || /^jd$/i.test(r)) {
    memberFilter.role = new RegExp('^junior', 'i');
  } else {
    memberFilter.role = new RegExp(`^${r}$`, 'i');
  }
}

// Team filter
if (team) {
  memberFilter.team = team.trim();
}

    const allMembers = await Member.find(memberFilter).sort({ memberId: 1 });
    const attendanceRecords = await Attendance.find({ date });

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.memberId, att);
    });

    // Merge members with attendance records (so unmarked active members are still listed)
    const report = allMembers.map((member) => {
      const record = attendanceMap.get(member.memberId);
      return {
  memberId: member.memberId,
  name: member.name,
  email: member.email,
  role: member.role,
  department: member.department,

  // IMPORTANT:
  // Send team information to frontend
  team: member.team,

  status: record
    ? record.status
    : 'Unmarked',

  attendanceId: record
    ? record._id
    : null,

  markedTime: record
    ? record.markedTime
    : null,

  markedBy: record
    ? record.markedBy
    : null,
};
    });

    return res.status(200).json({
      date,
      totalMembers: allMembers.length,
      markedCount: attendanceRecords.length,
      members: report,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get attendance history for a single member
 * @route   GET /api/attendance/member/:memberId
 * @access  Private (Admin, Coordinator, or Own Student)
 */
const getMemberAttendance = async (req, res, next) => {
  try {
    const { memberId } = req.params;

    // RBAC: If student, verify they are only accessing their own record
    if (req.user && req.user.role === 'student') {
      const allowed =
        (req.user.memberId && req.user.memberId === memberId.trim()) ||
        req.user.email === memberId.trim();

      if (!allowed) {
        return res.status(403).json({
          message: 'Access forbidden. Students can only view their own attendance history.',
        });
      }
    }

    const member = await Member.findOne({
      $or: [{ memberId: memberId.trim() }, { email: memberId.trim().toLowerCase() }],
    });

    if (!member) {
      return res.status(404).json({ message: `Member ${memberId} not found` });
    }

    const records = await Attendance.find({ memberId: member.memberId }).sort({ date: -1 });

    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const absentCount = records.filter((r) => r.status === 'Absent').length;
    const attendancePercentage =
      totalDays > 0 ? parseFloat(((presentCount / totalDays) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      member: {
        memberId: member.memberId,
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
      },
      stats: {
        totalDays,
        presentCount,
        absentCount,
        attendancePercentage,
      },
      records,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Get attendance statistics (overall and role-based breakdown)
 * @route   GET /api/attendance/stats
 * @access  Private (Admin & Coordinator)
 */
const getAttendanceStats = async (req, res, next) => {
  try {
    const date =
  req.query.date ||
  new Date().toISOString().split('T')[0];

const { team } = req.query;

const statsMemberFilter = {
  isActive: true,
};

if (team) {
  statsMemberFilter.team = team.trim();
}

const activeMembers = await Member.find(
  statsMemberFilter
);
    const attendanceRecords = await Attendance.find({ date });

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.memberId, att.status);
    });

    let totalPresent = 0;
    let totalAbsent = 0;

    const juniorStats = { total: 0, present: 0, absent: 0 };
    const seniorStats = { total: 0, present: 0, absent: 0 };
    const leadStats = {
  total: 0,
  present: 0,
  absent: 0,
};

    activeMembers.forEach((member) => {
      const status = attendanceMap.get(member.memberId);
      const isLead = /lead/i.test(member.role) || /lead/i.test(member.department);
      const isJunior = /junior/i.test(member.role) || /junior/i.test(member.department);
      const isSenior = !isLead && (/senior/i.test(member.role) || /senior/i.test(member.department));
      if (isJunior) juniorStats.total++;
      if (isSenior) seniorStats.total++;
      if (isLead) leadStats.total++;

      if (status === 'Present') {
        totalPresent++;
        if (isJunior) juniorStats.present++;
        if (isSenior) seniorStats.present++;
        if (isLead) leadStats.present++;
      } else if (status === 'Absent') {
        totalAbsent++;
        if (isJunior) juniorStats.absent++;
        if (isSenior) seniorStats.absent++;
        if (isLead) leadStats.absent++;
      }
    });

    const totalActive = activeMembers.length;
    const attendancePercentage =
      totalActive > 0 ? parseFloat(((totalPresent / totalActive) * 100).toFixed(2)) : 0;

    return res.status(200).json({
      date,
      totalMembers: totalActive,
      present: totalPresent,
      absent: totalAbsent,
      attendancePercentage,
      roleStats: {
        juniorDevelopers: {
          total: juniorStats.total,
          present: juniorStats.present,
          absent: juniorStats.absent,
          percentage:
            juniorStats.total > 0
              ? parseFloat(((juniorStats.present / juniorStats.total) * 100).toFixed(2))
              : 0,
        },
        seniorDevelopers: {
          total: seniorStats.total,
          present: seniorStats.present,
          absent: seniorStats.absent,
          percentage:
            seniorStats.total > 0
              ? parseFloat(((seniorStats.present / seniorStats.total) * 100).toFixed(2))
              : 0,
        },
        leads: {
  total: leadStats.total,
  present: leadStats.present,
  absent: leadStats.absent,
  percentage:
    leadStats.total > 0
      ? parseFloat(
          (
            (leadStats.present /
              leadStats.total) *
            100
          ).toFixed(2)
        )
      : 0,
},
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc    Generate & download daily attendance PDF report
 * @route   GET /api/attendance/report/:date
 * @access  Private (Admin & Coordinator)
 */
const generateDailyReportPDF = async (req, res, next) => {
  try {
    const { date } = req.params;

    // Get members and attendance
    const activeMembers = await Member.find({ isActive: true }).sort({ memberId: 1 });
    const attendanceRecords = await Attendance.find({ date });

    const attendanceMap = new Map();
    attendanceRecords.forEach((att) => {
      attendanceMap.set(att.memberId, att);
    });

    let present = 0;
    let absent = 0;
    const junior = { total: 0, present: 0, absent: 0 };
    const senior = { total: 0, present: 0, absent: 0 };
    const lead = { total: 0, present: 0, absent: 0 };

    const memberReport = activeMembers.map((m) => {
      const att = attendanceMap.get(m.memberId);
      const isLead = /lead/i.test(m.role) || /lead/i.test(m.department);
      const isJunior = /junior/i.test(m.role) || /junior/i.test(m.department);
      const isSenior = !isLead && (/senior/i.test(m.role) || /senior/i.test(m.department));
      if (isJunior) junior.total++;
      if (isSenior) senior.total++;
      if (isLead) lead.total++;

      const status = att ? att.status : 'Absent';
      if (status === 'Present') {
        present++;
        if (isJunior) junior.present++;
        if (isSenior) senior.present++;
        if (isLead) lead.present++;
      } else {
        absent++;
        if (isJunior) junior.absent++;
        if (isSenior) senior.absent++;
        if (isLead) lead.absent++;
      }

      return {
        memberId: m.memberId,
        team: m.team,
        name: m.name,
        role: m.role,
        status,
        markedTime: att ? att.markedTime : null,
      };
    });

    const totalMembers = activeMembers.length;
    const attendancePercentage =
      totalMembers > 0 ? parseFloat(((present / totalMembers) * 100).toFixed(2)) : 0;

    const stats = {
      totalMembers,
      present,
      absent,
      attendancePercentage,
      roleStats: {
        juniorDevelopers: junior,
        seniorDevelopers: senior,
        leads: lead,
      },
    };

    const pdfBuffer = generateAttendancePDF({
      date,
      stats,
      members: memberReport,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=C4GT_Attendance_Report_${date}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.send(pdfBuffer);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  markAttendance,
  markBulkAttendance,
  updateAttendance,
  getDailyAttendance,
  getMemberAttendance,
  getAttendanceStats,
  generateDailyReportPDF,
};
