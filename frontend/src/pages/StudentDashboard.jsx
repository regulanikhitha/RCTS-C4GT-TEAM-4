import React from 'react';
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

export default function StudentDashboard() {
  const attendanceData = [
    { day: 'Mon', attendance: 88 },
    { day: 'Tue', attendance: 94 },
    { day: 'Wed', attendance: 91 },
    { day: 'Thu', attendance: 96 },
    { day: 'Fri', attendance: 89 },
    { day: 'Sat', attendance: 93 },
  ];

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
    </>
  );
}