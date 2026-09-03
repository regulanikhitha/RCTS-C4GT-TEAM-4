import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import api from '../api/axios';
import toast, { Toaster } from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      setResetToken(data.resetToken);
      toast.success('OTP verified!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { email, resetToken, ...passwords });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <div className="login-bg-circle" style={{ width: 400, height: 400, top: -100, right: -100 }} />
      <div className="login-bg-circle" style={{ width: 300, height: 300, bottom: -80, left: -80 }} />

      <div className="login-card">
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={15} /> Back to Login
        </Link>

        <div className="login-logo">
          <div className="login-logo-badge">
            <img src="/logo.svg" width="56" height="56" alt="C4GT HUB logo" />
          </div>
          <h1 className="login-heading">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'New Password'}
          </h1>
          <p className="login-sub">
            {step === 1 ? 'Enter your email to receive a verification code'
              : step === 2 ? `OTP sent to ${email}`
              : 'Enter your new secure password'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: step >= s ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {error && <div className="login-error">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="email" className="form-input" style={{ paddingLeft: 36 }} placeholder="your@email.com" required value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>{loading ? 'Sending…' : 'Send OTP'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtpSubmit}>
            <div className="form-group">
              <label className="form-label">6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input" style={{ paddingLeft: 36, letterSpacing: 6, fontSize: 18, textAlign: 'center' }} placeholder="• • • • • •" maxLength={6} required value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify OTP'}</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="form-input" style={{ paddingLeft: 36 }} placeholder="Min 8 chars, uppercase, number, special" required value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="password" className="form-input" style={{ paddingLeft: 36 }} placeholder="Repeat new password" required value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
