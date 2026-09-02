import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import PermissionDashboard from './pages/PermissionDashboard';
import AttendanceDashboard from './pages/AttendanceDashboard';
import PermissionPortal from './pages/PermissionPortal';
import Members from './pages/Members';
import CalendarPage from './pages/Calendar';
import Reports from './pages/Reports';

function getDefaultDashboardPath(role) {
  if (role === 'student') return '/student-dashboard';
  if (role === 'coordinator') return '/coordinator-dashboard';
  return '/admin-dashboard';
}

function AppLayout() {
  const { user } = useAuth();

  if (!user) return null;

  const defaultDashboardPath = getDefaultDashboardPath(user.role);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Routes>
          <Route path="/dashboard" element={<Navigate to={defaultDashboardPath} replace />} />
          <Route
            path="/admin-dashboard"
            element={
              user.role === 'student'
                ? <Navigate to="/student-dashboard" replace />
                : user.role === 'admin'
                  ? <Dashboard />
                  : <Navigate to="/coordinator-dashboard" replace />
            }
          />
          <Route
            path="/coordinator-dashboard"
            element={
              user.role === 'student'
                ? <Navigate to="/student-dashboard" replace />
                : user.role === 'coordinator'
                  ? <CoordinatorDashboard />
                  : <Navigate to="/admin-dashboard" replace />
            }
          />
          <Route
            path="/student-dashboard"
            element={
              user.role === 'student'
                ? <StudentDashboard />
                : <Navigate to={defaultDashboardPath} replace />
            }
          />
          <Route path="/permission-dashboard" element={<PermissionDashboard />} />
          <Route path="/attendance" element={<AttendanceDashboard />} />
          <Route path="/permissions" element={<PermissionPortal />} />
          <Route path="/members" element={<Members />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="*" element={<Navigate to={defaultDashboardPath} replace />} />
        </Routes>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }) {
  const TopBar = React.lazy(() => import('./components/TopBar'));
  return (
    <>
      <div className="topbar" style={{ borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center' }}>
        <h1 style={{ fontSize: 16, fontWeight: 700 }}>{title}</h1>
      </div>
      <div className="page-content">
        <div className="empty-state" style={{ marginTop: 60 }}>
          <h3>{title}</h3>
          <p>This page is coming soon.</p>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Inter, sans-serif', fontSize: 13, borderRadius: 8 },
            duration: 3000,
          }}
        />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
