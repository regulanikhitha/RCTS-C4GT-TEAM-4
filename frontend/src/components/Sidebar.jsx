import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, FileText, Users,
  Calendar, BarChart2, Bell, LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, to: '/admin-dashboard' },
  { label: 'Coordinator Dashboard', icon: UserCheck, to: '/coordinator-dashboard' },
  { label: 'Student Dashboard', icon: Users, to: '/student-dashboard' },
  { label: 'Permission Dashboard', icon: FileText, to: '/permission-dashboard' },
  { label: 'Attendance', icon: UserCheck, to: '/attendance' },
  { label: 'Members', icon: Users, to: '/members' },
  { label: 'Calendar', icon: Calendar, to: '/calendar' },
  { label: 'Reports', icon: BarChart2, to: '/reports' },
  { label: 'Notifications', icon: Bell, to: '/notifications' },
];

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/admin-dashboard');
  };

  return (
    <aside className="sidebar">
      {/* Logo — clicking navigates to Permission Portal */}
      <div className="sidebar-logo" onClick={handleLogoClick} title="Go to Permission Portal">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
            <circle cx="20" cy="20" r="20" fill="url(#lg1)"/>
            <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle"
              fontSize="13" fontWeight="900" fill="white">C4</text>
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f59e0b"/>
                <stop offset="0.5" stopColor="#ef4444"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="brand">C4GT HUB</span>
          <span className="sub">@KIET</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link w-full" onClick={handleLogout} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
