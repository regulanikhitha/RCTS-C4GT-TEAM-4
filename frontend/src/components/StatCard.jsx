import React from 'react';

export default function StatCard({ icon, label, value, sub, colorClass = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${colorClass}`}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className={`stat-value ${colorClass === 'green' ? 'green' : colorClass === 'red' ? 'red' : colorClass === 'purple' ? 'purple' : ''}`}>
          {value}
        </div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}
