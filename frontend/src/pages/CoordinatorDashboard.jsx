import React from 'react';
import TopBar from '../components/TopBar';

export default function CoordinatorDashboard() {
  return (
    <>
      <TopBar title="Coordinator Dashboard" />
      <div className="page-content">
        <div className="page-header">
          <h1>Coordinator Dashboard</h1>
          <p>Manage team attendance, attendance rate, and operational updates.</p>
        </div>
        <div className="stat-grid">
          <div className="stat-card blue">
            <div className="stat-label">Teams</div>
            <div className="stat-value">9</div>
            <div className="stat-sub">Active teams</div>
          </div>
          <div className="stat-card green">
            <div className="stat-label">Present</div>
            <div className="stat-value">76</div>
            <div className="stat-sub">Members present</div>
          </div>
          <div className="stat-card red">
            <div className="stat-label">Pending</div>
            <div className="stat-value">12</div>
            <div className="stat-sub">Action required</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-label">Attendance</div>
            <div className="stat-value">86%</div>
            <div className="stat-sub">This week</div>
          </div>
        </div>
      </div>
    </>
  );
}
