import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

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

  useEffect(() => {
    if (selectedRole) {
      setForm((current) => ({
        ...current,
        email: current.email || `${selectedRole}@c4gt.com`,
      }));
    }
  }, [selectedRole]);

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

    toast.success('Welcome back!');
    localStorage.removeItem('c4gt_login_role');
    navigate(result.redirect || '/admin-dashboard');
  };

  return (
    <div className="login-page">
      <Toaster position="top-right" />
      {/* Decorative circles */}
      <div className="login-bg-circle" style={{ width: 400, height: 400, top: -100, right: -100 }} />
      <div className="login-bg-circle" style={{ width: 300, height: 300, bottom: -80, left: -80 }} />
      <div className="login-bg-circle" style={{ width: 180, height: 180, top: '40%', left: '8%' }} />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-badge">
            <span>C4GT HUB</span>
            <span style={{ fontSize: 12 }}>@KIET</span>
          </div>
          <h1 className="login-heading">{selectedRole ? `${roleLabelMap[selectedRole] || 'Role'} Login` : 'Welcome Back 👋'}</h1>
          <p className="login-sub">
            {selectedRole
              ? `Use the ${roleLabelMap[selectedRole] || 'selected'} account credentials to continue.`
              : 'Sign in to your C4GT Hub account'}
          </p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
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
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: 36, paddingRight: 40 }}
                placeholder="••••••••"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          C4GT Hub Attendance Management System &copy; 2026
        </p>
      </div>
    </div>
  );
}
