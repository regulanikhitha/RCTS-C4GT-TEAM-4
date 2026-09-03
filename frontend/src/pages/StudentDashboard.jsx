import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Bell, Megaphone, Calendar, Users, X, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';

export default function StudentDashboard() {
  const navigate = useNavigate();
  
  // Popup Notification State
  const [latestNotification, setLatestNotification] = useState(null);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

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
  const attendanceData = [
    { day: 'Mon', attendance: 88 },
    { day: 'Tue', attendance: 94 },
    { day: 'Wed', attendance: 91 },
    { day: 'Thu', attendance: 96 },
    { day: 'Fri', attendance: 89 },
    { day: 'Sat', attendance: 93 },
  ];

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
              <h3 style={{ margin: '8px 0 4px', fontSize: 24, color: '#1e293b' }}>91%</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>Weekly attendance overview</p>
            </div>
            <div style={{ textAlign: 'right', color: '#0f766e', fontSize: 14, fontWeight: 700 }}>
              5 present
              <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500, marginTop: 4 }}>1 missed</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="attendance" stroke="#0f766e" strokeWidth={3} dot={{ r: 4, fill: '#0f766e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
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
                    📢 New Hub Announcement!
                  </h3>
                  <span style={{ fontSize: '12px', color: '#4c1d95' }}>
                    Broadcasted to All Members (81)
                  </span>
                </div>
              </div>

              <button
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
              </button>
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
                <span
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
                </span>
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
              <button
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
              </button>

              <button
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
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}