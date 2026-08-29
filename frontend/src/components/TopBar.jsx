import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-search">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search members, requests..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="avatar-btn">
          <div className="avatar">{initials}</div>
          <div className="avatar-info">
            <div className="avatar-name">{user?.name || 'User'}</div>
            <div className="avatar-role" style={{ textTransform: 'capitalize' }}>{user?.role || ''}</div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  );
}
