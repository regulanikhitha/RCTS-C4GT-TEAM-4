import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
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
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.selectedRole || localStorage.getItem('c4gt_login_role') || null;
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

    const userRole = result.user?.role || form.email.split('@')[0];

    if (selectedRole && userRole !== selectedRole) {
      setError(`This login page is only for ${roleLabelMap[selectedRole] || 'the selected'} users. Please use the correct account.`);
      localStorage.removeItem('c4gt_token');
      localStorage.removeItem('c4gt_user');
      return;
    }

    toast.success('Welcome back!', { duration: 3000 });
    localStorage.removeItem('c4gt_login_role');
    navigate(result.redirect || '/admin-dashboard');
  };

  return (
    <div className="login-page">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      {/* Decorative circles */}
      <div className="login-bg-circle" style={{ width: 400, height: 400, top: -100, right: -100 }} />
      <div className="login-bg-circle" style={{ width: 300, height: 300, bottom: -80, left: -80 }} />
      <div className="login-bg-circle" style={{ width: 180, height: 180, top: '40%', left: '8%' }} />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-badge">
            <img src="/logo.svg" width="56" height="56" alt="C4GT HUB logo" />
          </div>
          <h1 className="login-heading">{selectedRole ? `${roleLabelMap[selectedRole] || 'Role'} Login` : 'Welcome Back'}</h1>
          <p className="login-sub">
            {selectedRole
              ? `Use the ${roleLabelMap[selectedRole] || 'selected'} account credentials to continue.`
              : 'Sign in to your C4GT Hub account'}
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
                placeholder="coordinator@kiet.edu"
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
              type="button"
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
