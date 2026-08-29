import React from 'react';
import TopBar from '../components/TopBar';

export default function StudentDashboard() {
  return (
    <>
      <TopBar title="Student Dashboard" />
      <div className="page-content">
        <div className="page-header">
          <h1>Student Dashboard</h1>
          <p>Check your attendance, leave requests, and mentoring updates.</p>
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
