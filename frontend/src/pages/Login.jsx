import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

const roleLabelMap = {
  admin: 'Admin',
  coordinator: 'Coordinator',
  student: 'Student',
};

export default function Login() {
  const { login, loading, clearSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState(
    () => location.state?.selectedRole || localStorage.getItem('c4gt_login_role') || 'student'
  );
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = () => {
    localStorage.removeItem('c4gt_login_role');
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(form.email, form.password);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    const userRole = result.user?.role;

    // Strict role check: user role MUST match the selected login tab!
    if (selectedRole && userRole !== selectedRole) {
      const activeTabName = roleLabelMap[selectedRole] || selectedRole;
      const actualRoleName = roleLabelMap[userRole] || userRole;
      setError(`Login restricted: This tab is strictly for ${activeTabName} login. You entered credentials for an ${actualRoleName} account. Please click the "${actualRoleName}" tab above to sign in.`);
      clearSession();
      return;
    }

    const redirectPath = selectedRole
      ? (selectedRole === 'student' ? '/student-dashboard' : selectedRole === 'coordinator' ? '/coordinator-dashboard' : '/admin-dashboard')
      : (result.redirect || (userRole === 'student' ? '/student-dashboard' : userRole === 'coordinator' ? '/coordinator-dashboard' : '/admin-dashboard'));

    const userName = result.user?.name ? `, ${result.user.name}` : '';
    toast.success(`Welcome back${userName}!`, {
      id: 'welcome-back-toast',
      duration: 5000,
    });
    // Guaranteed 5-second dismissal failsafe
    setTimeout(() => {
      toast.dismiss('welcome-back-toast');
    }, 5000);

    localStorage.removeItem('c4gt_login_role');
    navigate(redirectPath);
  };

  return (
    <div className="login-page">
      {/* Decorative circles */}
      <div className="login-bg-circle" style={{ width: 400, height: 400, top: -100, right: -100 }} />
      <div className="login-bg-circle" style={{ width: 300, height: 300, bottom: -80, left: -80 }} />
      <div className="login-bg-circle" style={{ width: 180, height: 180, top: '40%', left: '8%' }} />

      <div className="login-card">
        {/* Role Switcher Tabs */}
        <div
          className="login-role-tabs"
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 20,
            background: '#f1f5f9',
            padding: 4,
            borderRadius: 12,
            border: '1px solid #e2e8f0',
          }}
        >
          {['student', 'coordinator', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setSelectedRole(r);
                localStorage.setItem('c4gt_login_role', r);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '8px 10px',
                border: 'none',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: selectedRole === r ? 700 : 500,
                cursor: 'pointer',
                background: selectedRole === r ? '#0f766e' : 'transparent',
                color: selectedRole === r ? '#ffffff' : '#64748b',
                boxShadow: selectedRole === r ? '0 2px 4px rgba(15, 118, 110, 0.2)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {roleLabelMap[r]}
            </button>
          ))}
        </div>

        <div className="login-logo">
          <div className="login-logo-badge">
            <img src="/logo.svg" width="56" height="56" alt="C4GT HUB logo" />
          </div>
          <h1 className="login-heading">{roleLabelMap[selectedRole] || 'Role'} Login</h1>
          <p className="login-sub">
            Use your {roleLabelMap[selectedRole] || 'selected'} account credentials to continue.
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <Label className="form-label">Email Address</Label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <Input
                type="email"
                className="form-input"
                style={{ paddingLeft: 36 }}
                placeholder="Enter your email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Label className="form-label" style={{ marginBottom: 0 }}>Password</Label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <Input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="password-toggle"
                      onClick={() => setShowPass(s => !s)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showPass ? 'Hide password' : 'Show password'}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <Button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="btn btn-secondary"
              onClick={handleCancel}
              style={{
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #e2e8f0',
              }}
            >
              Cancel
            </Button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          C4GT Hub Attendance Management System &copy; 2026
        </p>
      </div>
    </div>
  );
}
