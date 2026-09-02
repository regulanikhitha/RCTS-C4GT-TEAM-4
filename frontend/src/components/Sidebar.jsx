import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Users,
  Calendar,
  BarChart2,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { label: 'Admin Dashboard', icon: LayoutDashboard, to: '/admin-dashboard', roles: ['admin'] },
  { label: 'Coordinator Dashboard', icon: UserCheck, to: '/coordinator-dashboard', roles: ['coordinator'] },
  { label: 'Student Dashboard', icon: Users, to: '/student-dashboard', roles: ['student', 'admin', 'coordinator'] },
  { label: 'Permission Dashboard', icon: FileText, to: '/permission-dashboard', roles: ['student', 'admin', 'coordinator'] },
  { label: 'Attendance', icon: UserCheck, to: '/attendance', roles: ['admin', 'coordinator'] },
  { label: 'Members', icon: Users, to: '/members', roles: ['admin', 'coordinator'] },
  { label: 'Calendar', icon: Calendar, to: '/calendar', roles: ['student', 'admin', 'coordinator'] },
  { label: 'Reports', icon: BarChart2, to: '/reports', roles: ['student', 'admin', 'coordinator'] },
  { label: 'Notifications', icon: Bell, to: '/notifications', roles: ['student', 'admin', 'coordinator'] },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const visibleNav = NAV.filter((item) => item.roles.includes(user?.role || 'admin'));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    const defaultRoute = user?.role === 'student' ? '/student-dashboard' : '/admin-dashboard';
    navigate(defaultRoute);
  };

  return (
    <aside className="sidebar">
      {/* Logo — clicking navigates to Permission Portal */}
      <div className="sidebar-logo" onClick={handleLogoClick} title="Go to Permission Portal">
        <div className="sidebar-logo-icon">
          <img src="/logo.svg" width="28" height="28" alt="C4GT HUB logo" />
        </div>
        <div className="sidebar-logo-text">
          <span className="brand">C4GT HUB</span>
          <span className="sub">@KIET</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {visibleNav.map(({ label, icon: Icon, to }) => (
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
