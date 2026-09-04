import React from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ title, hideSearch = false }) {
  const { user, adminSearch, setAdminSearch } = useAuth();
  const isAdmin = user?.role === 'admin';

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleSearch = (e) => {
    e.preventDefault();
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
        <div className="avatar-btn">
            <div className="avatar">{initials}</div>
            <div className="avatar-info">
              <div className="avatar-name">{user?.name || 'User'}</div>
              <div className="avatar-role" style={{ textTransform: 'capitalize' }}>{user?.role || ''}</div>
            </div>
        </div>
      </div>
    </header>
  );
}
