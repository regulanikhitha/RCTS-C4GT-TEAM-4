import React, { useState } from 'react';
import TopBar from '../components/TopBar';

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

        {/* Team-wise Option */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <label
            htmlFor="team-select"
            style={{ fontWeight: '600' }}
          >
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

        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Attendance</div>
            <div className="stat-value">91%</div>
            <div className="stat-sub">This month</div>
          </div>

          <div className="stat-card green">
            <div className="stat-label">Leaves</div>
            <div className="stat-value">2</div>
            <div className="stat-sub">Approved</div>
          </div>

          <div className="stat-card red">
            <div className="stat-label">Missed</div>
            <div className="stat-value">1</div>
            <div className="stat-sub">Pending check</div>
          </div>

          <div className="stat-card purple">
            <div className="stat-label">Tasks</div>
            <div className="stat-value">5</div>
            <div className="stat-sub">Open tasks</div>
          </div>
        </div>
      </div>
    </>
  );
}