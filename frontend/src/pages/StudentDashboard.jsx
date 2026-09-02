import React, { useState } from 'react';
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
  const [selectedTeam, setSelectedTeam] = useState('TEAM-4');

  const teams = [
    'TEAM-1',
    'TEAM-2',
    'TEAM-3',
    'TEAM-4',
    'TEAM-5',
    'TEAM-6',
    'TEAM-7',
    'TEAM-8',
    'TEAM-9',
  ];

  const teamDetails = {
    'TEAM-1': { mentor: 'Dr. Meera Sharma', members: 14, time: 'Mon & Thu • 4:00 PM', project: 'AI Assistive Mentor' },
    'TEAM-2': { mentor: 'Mr. Raghav Iyer', members: 13, time: 'Tue & Fri • 4:30 PM', project: 'Smart Attendance Insights' },
    'TEAM-3': { mentor: 'Dr. Ananya Rao', members: 15, time: 'Mon & Wed • 5:00 PM', project: 'Access & Permissions Tracker' },
    'TEAM-4': { mentor: 'Ms. Sushma Verma', members: 12, time: 'Tue & Thu • 3:30 PM', project: 'C4GT Hub Platform' },
    'TEAM-5': { mentor: 'Dr. Vinay Joshi', members: 14, time: 'Wed & Fri • 4:00 PM', project: 'Digital Knowledge Base' },
    'TEAM-6': { mentor: 'Prof. Nisha Kapoor', members: 13, time: 'Mon & Fri • 3:45 PM', project: 'Mentor Matching Portal' },
    'TEAM-7': { mentor: 'Mr. Karthik Nair', members: 12, time: 'Tue & Thu • 5:00 PM', project: 'Volunteer Task Planner' },
    'TEAM-8': { mentor: 'Dr. Pooja Reddy', members: 15, time: 'Wed & Sat • 10:00 AM', project: 'Learning Analytics' },
    'TEAM-9': { mentor: 'Mrs. Kavya Malhotra', members: 11, time: 'Mon & Thu • 5:15 PM', project: 'Community Impact Dashboard' },
  };

  const selectedTeamInfo = teamDetails[selectedTeam] || teamDetails['TEAM-4'];
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
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <label htmlFor="team-select" style={{ fontWeight: '600' }}>
            Team:
          </label>

          <select
            id="team-select"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              fontSize: '14px',
              cursor: 'pointer',
              background: '#fff',
            }}
          >
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>

          <span style={{ fontWeight: '600' }}>
            Selected: {selectedTeam}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 16,
              padding: '20px',
              boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#6366f1', textTransform: 'uppercase' }}>
              Team Details
            </div>
            <h3 style={{ margin: '10px 0 8px', fontSize: 24 }}>{selectedTeam}</h3>
            <div style={{ display: 'grid', gap: 10, color: '#334155', fontSize: 14 }}>
              <div><strong>Mentor:</strong> {selectedTeamInfo.mentor}</div>
              <div><strong>Members:</strong> {selectedTeamInfo.members}</div>
              <div><strong>Meeting Time:</strong> {selectedTeamInfo.time}</div>
              <div><strong>Project:</strong> {selectedTeamInfo.project}</div>
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)',
              border: '1px solid #c7d2fe',
              borderRadius: 16,
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#4338ca', textTransform: 'uppercase' }}>
              Team Status
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, margin: '12px 0 8px', color: '#1e293b' }}>Active</div>
            <p style={{ margin: 0, color: '#475569', lineHeight: 1.6 }}>
              Your team is progressing well and all attendance records are currently synced with the portal.
            </p>
          </div>
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