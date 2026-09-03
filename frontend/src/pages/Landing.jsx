import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Landing() {
  const navigate = useNavigate();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const loginOptions = [
    { role: 'admin', label: 'Admin Login', route: '/admin-dashboard', name: 'Admin User' },
    { role: 'coordinator', label: 'Coordinator Login', route: '/coordinator-dashboard', name: 'Coordinator User' },
    { role: 'student', label: 'Student Login', route: '/student-dashboard', name: 'Student User' },
  ];

  const loginAsRole = (role, route, name) => {
    localStorage.setItem('c4gt_login_role', role);
    setShowLoginPopup(false);
    navigate('/login', { state: { selectedRole: role, roleLabel: labelFromRole(role) } });
  };

  const labelFromRole = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'coordinator') return 'Coordinator';
    return 'Student';
  };

  const goToDashboard = () => {
    setShowLoginPopup(true);
  };

  const handleLogin = () => {
    setShowLoginPopup(true);
  };

  const handleDashboardCardClick = (route) => {
    const routeMap = {
      '/admin-dashboard': 'admin',
      '/coordinator-dashboard': 'coordinator',
      '/student-dashboard': 'student',
      '/permission-dashboard': 'admin',
    };

    const role = routeMap[route] || 'admin';
    const demoUser = {
      name: `${labelFromRole(role)} User`,
      email: `${role}@c4gt.com`,
      role,
    };

    localStorage.setItem('c4gt_user', JSON.stringify(demoUser));
    localStorage.setItem('c4gt_token', `demo-${role}-token`);
    navigate(route);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success('Thanks! Your message has been noted.');
    event.target.reset();
  };

  return (
    <div className="lp-page">
      <div className="lp-toast" id="lpToast" />

      {showLoginPopup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowLoginPopup(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: 18,
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6366f1' }}>
                  Choose role
                </div>
                <h3 style={{ marginTop: 6, fontSize: 26, fontWeight: 800, color: '#0f172a' }}>Login as</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginPopup(false)}
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: 10,
                  width: 36,
                  height: 36,
                  fontSize: 20,
                  color: '#475569',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Close login popup"
                title="Close"
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {loginOptions.map(({ role, label, route, name }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => loginAsRole(role, route, name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0.9rem 1rem',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  <span>{label}</span>
                  <span style={{ color: '#4338ca', fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <header className="lp-nav">
        <button type="button" className="lp-brand" onClick={handleLogin}>
          <div className="lp-brand-badge">
            <img src="/logo.svg" width="36" height="36" alt="C4GT HUB logo" />
          </div>
          <span className="lp-brand-text">
            <span className="brand">C4GT HUB</span>
            <span className="sub">@KIET</span>
          </span>
        </button>

        <div className="lp-nav-right">
        </div>
      </header>

      <main>
        <section className="lp-hero" id="home">
          <div>
            <span className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Built for the C4GT cohort at KIET
            </span>
            <h1>
              One place to track <span className="lp-grad">attendance</span>, permissions &amp; every team member.
            </h1>
            <p className="lp-hero-sub">
              C4GT Hub replaces the spreadsheet chase with a single dashboard — coordinators mark attendance in seconds, students request leave without a WhatsApp thread, and admins see the whole cohort at a glance.
            </p>
            <div className="lp-hero-cta">
              <button type="button" className="lp-btn-primary" onClick={handleLogin}>
                Login to your dashboard →
              </button>
            </div>
            <div className="lp-hero-stats">
              <div className="lp-hero-stat">
                <strong>81</strong>
                <span>Members</span>
              </div>
              <div className="lp-hero-stat">
                <strong>9</strong>
                <span>Teams</span>
              </div>
              <div className="lp-hero-stat">
                <strong>3</strong>
                <span>Role dashboards</span>
              </div>
            </div>
          </div>

          <div className="lp-hero-card">
            <div className="lp-hero-card-head">
              <span className="lp-chart-title">Admin dashboard overview</span>
              <span className="lp-live-pill">
                <span className="lp-live-dot" />
                Live
              </span>
            </div>
            <div className="lp-hero-card-body">
              <div className="lp-dashboard-mini-grid">
                {[
                  { label: 'Admin', route: '/admin-dashboard', value: '94%', tint: 'purple' },
                  { label: 'Coordinator', route: '/coordinator-dashboard', value: '86%', tint: 'blue' },
                  { label: 'Student', route: '/student-dashboard', value: '91%', tint: 'green' },
                  { label: 'Permission', route: '/permission-dashboard', value: '72%', tint: 'orange' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`lp-mini-dashboard-card ${item.tint}`}
                    onClick={() => handleDashboardCardClick(item.route)}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </button>
                ))}
              </div>

              <svg viewBox="0 0 400 160" width="100%" height="160" preserveAspectRatio="none" aria-label="Attendance chart">
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="400" y2="40" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="0" y1="90" x2="400" y2="90" stroke="#e2e8f0" strokeWidth="1" />
                <line x1="0" y1="140" x2="400" y2="140" stroke="#e2e8f0" strokeWidth="1" />
                <polyline points="0,70 100,95 200,25 300,80 400,10" fill="none" stroke="#4338ca" strokeWidth="2.5" />
                <polygon points="0,70 100,95 200,25 300,80 400,10 400,160 0,160" fill="url(#areaFill)" />
                <g fontSize="11" fill="#64748b" fontFamily="Inter, sans-serif">
                  <text x="0" y="155">Mon</text>
                  <text x="90" y="155">Tue</text>
                  <text x="190" y="155">Wed</text>
                  <text x="290" y="155">Thu</text>
                  <text x="380" y="155">Fri</text>
                </g>
              </svg>
              <div className="lp-hero-card-footer">
                <div>
                  <strong>92%</strong>
                  <span>Avg. this week</span>
                </div>
                <div>
                  <strong>9</strong>
                  <span>Teams tracked</span>
                </div>
                <div>
                  <strong>+4%</strong>
                  <span>vs last week</span>
                </div>
              </div>
            </div>
          </div>
        </section>




      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <img src="/logo.svg" width="28" height="28" alt="C4GT HUB logo" />
            C4GT HUB @KIET
          </div>
          <small>© 2026 C4GT Hub Attendance Management System</small>
        </div>
      </footer>
    </div>
  );
}
