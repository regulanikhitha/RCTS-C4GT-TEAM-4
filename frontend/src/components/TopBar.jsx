import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title, hideSearch = false, unreadCount = 0 }) {
  const { user, adminSearch, setAdminSearch, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>

      {isAdmin && !hideSearch && (
        <form className="topbar-search" onSubmit={handleSearch}>
          <Search size={14} />
          <input
            type="text"
            placeholder="Search members, requests..."
            value={adminSearch}
            onChange={e => setAdminSearch(e.target.value)}
            aria-label="Admin search"
          />
        </form>
      )}

      <div className="topbar-actions">
        <button type="button" className="icon-btn" aria-label="Notifications" onClick={handleNotifications}>
          <Bell size={18} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="avatar-btn"
            onClick={() => setMenuOpen((open) => !open)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
            aria-label="User menu"
          >
            <div className="avatar">{initials}</div>
            <div className="avatar-info">
              <div className="avatar-name">{user?.name || 'User'}</div>
              <div className="avatar-role" style={{ textTransform: 'capitalize' }}>{user?.role || ''}</div>
            </div>
          </button>

          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 10px)',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.12)',
                minWidth: 150,
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
