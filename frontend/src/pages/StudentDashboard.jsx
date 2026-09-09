import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, Megaphone, Calendar, Users, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { AttendanceDoughnutChart, AttendanceTrendChart, ChartContainer } from '../components/ui/chart';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Popup Notification State
  const [latestNotification, setLatestNotification] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [attendance, setAttendance] = useState({ stats: null, records: [] });
  const [attendancePeriod, setAttendancePeriod] = useState('weekly');
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  useEffect(() => {
    const studentIdentifier = user?.memberId || user?.email;
    if (!studentIdentifier) return undefined;

    let isMounted = true;
    setAttendanceLoading(true);
    api.get(`/attendance/member/${encodeURIComponent(studentIdentifier)}`)
      .then(({ data }) => {
        if (isMounted) setAttendance({ stats: data.stats || null, records: data.records || [] });
      })
      .catch(() => {
        if (isMounted) setAttendance({ stats: null, records: [] });
      })
      .finally(() => {
        if (isMounted) setAttendanceLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const attendanceStats = attendance.stats || {};
  const attendancePercentage = Number(attendanceStats.attendancePercentage || 0);
  const presentCount = Number(attendanceStats.presentCount || 0);
  const absentCount = Number(attendanceStats.absentCount || 0);

  const trendData = useMemo(() => {
    const recordsByDate = attendance.records.reduce((result, record) => {
      result[record.date?.slice(0, 10)] = record.status;
      return result;
    }, {});
    const today = new Date();
    const days = attendancePeriod === 'weekly'
      ? 7
      : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    return Array.from({ length: days }, (_, index) => {
      const date = attendancePeriod === 'weekly'
        ? new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - index - 1))
        : new Date(today.getFullYear(), today.getMonth(), index + 1);
      const dateKey = date.toISOString().slice(0, 10);
      const status = recordsByDate[dateKey];
      return {
        name: attendancePeriod === 'weekly'
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : String(index + 1),
        status,
        value: status ? 1 : 0,
        present: status === 'Present' ? 1 : 0,
        absent: status === 'Absent' ? 1 : 0,
      };
    });
  }, [attendance.records, attendancePeriod]);

  const percentageData = [
    { name: 'Present', value: presentCount, color: '#0f766e' },
    { name: 'Absent', value: absentCount, color: '#e11d48' },
  ];

  useEffect(() => {
    let isMounted = true;
    const checkNewNotifications = async () => {
      let publishedList = [];

      try {
        const { data } = await api.get('/notifications');
        if (data && data.success && Array.isArray(data.data)) {
          publishedList = data.data.filter((n) => n.status === 'published');
        }
      } catch (e) {
        // Fallback to localStorage
      }

      if (publishedList.length === 0) {
        try {
          const saved = localStorage.getItem('c4gt_notifications');
          if (saved) {
            const parsed = JSON.parse(saved);
            publishedList = parsed.filter((n) => n.status === 'published');
          }
        } catch (e) {}
      }

      if (publishedList.length > 0 && isMounted) {
        // Pick the most recent published notification
        const latest = publishedList[0];
        setLatestNotification(latest);

        // Check if student has already acknowledged/dismissed this specific notification ID in session
        const seenId = sessionStorage.getItem('c4gt_seen_popup_notif');
        if (seenId !== latest._id) {
          setShowNotificationPopup(true);
        }
      }
    };

    checkNewNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleClosePopup = () => {
    if (latestNotification) {
      sessionStorage.setItem('c4gt_seen_popup_notif', latestNotification._id);
    }
    setShowNotificationPopup(false);
  };

  const handleGoToNotifications = () => {
    handleClosePopup();
    navigate('/notifications');
  };
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Holiday':
        return { bg: '#fce7f3', color: '#9d174d' };
      case 'Event':
        return { bg: '#e0e7ff', color: '#3730a3' };
      case 'Coding Contest':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'Mentor Meeting':
        return { bg: '#ccfbf1', color: '#115e59' };
      case 'Other':
      default:
        return { bg: '#f3e8ff', color: '#6b21a8' };
    }
  };

  return (
    <>
      <TopBar title="Student Dashboard" />

      <div className="page-content">
        <div className="page-header">
          <h1>Student Dashboard</h1>
          <p>
            Check your attendance, leave requests, and mentoring updates.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 16,
            padding: '20px',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#0f766e', textTransform: 'uppercase' }}>
                My Attendance
              </div>
              <h3 style={{ margin: '8px 0 4px', fontSize: 24, color: '#1e293b' }}>
                {attendanceLoading ? '...' : `${attendancePercentage}%`}
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Your attendance overview</p>
            </div>
            <div style={{ textAlign: 'right', color: '#0f766e', fontSize: 14, fontWeight: 700 }}>
              {presentCount} present
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500, marginTop: 4 }}>{absentCount} missed</div>
            </div>
          </div>

          <div className="student-attendance-chart-grid">
            <div className="student-attendance-trend">
              <div className="student-chart-heading">
                <div>
                  <strong>Attendance activity</strong>
                  <span>{attendancePeriod === 'weekly' ? 'Last 7 days' : 'Current month'}</span>
                </div>
                <div className="chart-period-toggle" role="group" aria-label="Attendance period">
                  <button className={attendancePeriod === 'weekly' ? 'active' : ''} onClick={() => setAttendancePeriod('weekly')}>Weekly</button>
                  <button className={attendancePeriod === 'monthly' ? 'active' : ''} onClick={() => setAttendancePeriod('monthly')}>Monthly</button>
                </div>
              </div>
              <ChartContainer height={250} className="student-trend-chart">
                <AttendanceTrendChart data={trendData} />
              </ChartContainer>
            </div>

            <div className="student-attendance-percentage">
              <div className="student-chart-heading">
                <div>
                  <strong>Attendance percentage</strong>
                  <span>All recorded days</span>
                </div>
              </div>
              <ChartContainer height={220} className="student-percentage-chart">
                <AttendanceDoughnutChart data={percentageData} />
                <div className="student-donut-total">
                  <strong>{attendancePercentage}%</strong>
                  <span>attendance</span>
                </div>
              </ChartContainer>
              <div className="student-percentage-legend">
                <span><i style={{ background: '#0f766e' }} />Present <b>{presentCount}</b></span>
                <span><i style={{ background: '#e11d48' }} />Absent <b>{absentCount}</b></span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* --- Student Login Notification Pop-Up Modal --- */}
      {showNotificationPopup && latestNotification && (
        <div className="modal-backdrop">
          <div
            className="modal-content-card"
            style={{
              maxWidth: '520px',
              border: '1.5px solid #c7d2fe',
              boxShadow: '0 25px 60px rgba(67, 56, 202, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
                borderBottom: '1px solid #ddd6fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: '#6366f1',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Megaphone size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e1b4b' }}>
                    New Hub Announcement
                  </h3>
                  <span style={{ fontSize: '12px', color: '#4c1d95' }}>
                    Broadcasted to All Members (81)
                  </span>
                </div>
              </div>

              <Button variant="ghost"
                onClick={handleClosePopup}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </Button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <Badge
                  style={{
                    backgroundColor: getTypeBadgeStyle(latestNotification.type).bg,
                    color: getTypeBadgeStyle(latestNotification.type).color,
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  {latestNotification.type}
                </Badge>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                  By {latestNotification.createdBy?.name || 'Admin'}
                </span>
              </div>

              <h4
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#0f172a',
                  marginBottom: '10px',
                  lineHeight: '1.35',
                }}
              >
                {latestNotification.title}
              </h4>

              <p
                style={{
                  fontSize: '14px',
                  color: '#334155',
                  lineHeight: '1.55',
                  marginBottom: '20px',
                  background: '#f8fafc',
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {latestNotification.message}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '12.5px',
                  color: '#64748b',
                  fontWeight: '600',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={15} />
                  <span>
                    {latestNotification.fromDate ? latestNotification.fromDate.split('T')[0] : ''}
                    {latestNotification.toDate && latestNotification.toDate !== latestNotification.fromDate
                      ? ` to ${latestNotification.toDate.split('T')[0]}`
                      : ''}
                  </span>
                </div>
                {latestNotification.time && (
                  <div>⏰ {latestNotification.time}</div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                background: '#f8fafc',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Button variant="outline"
                onClick={handleClosePopup}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} /> Got it
              </Button>

              <Button
                onClick={handleGoToNotifications}
                style={{
                  background: '#4338ca',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                View All Notifications <ArrowRight size={15} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}