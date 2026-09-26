import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function Landing() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="lp-page">
      <div className="lp-toast" id="lpToast" />

      <header className="lp-nav">
        <div className="lp-brand">
          <div className="lp-brand-badge">
            <img src="/logo.svg" width="36" height="36" alt="C4GT HUB logo" />
          </div>
          <span className="lp-brand-text">
            <span className="brand">C4GT HUB</span>
            <span className="sub">@KIET</span>
          </span>
        </div>

        <div className="lp-nav-right">
        </div>
      </header>

      <main>
        <section className="lp-hero" id="home">
          <div>
            <span className="lp-eyebrow">
              <span className="lp-eyebrow-dot" />
              Built for the C4GT HUB at KIET
            </span>
            <h1>
              One place to track <span className="lp-grad">attendance</span>, permissions &amp; every team member.
            </h1>
            <p className="lp-hero-sub">
              C4GT Hub replaces the spreadsheet chase with a single dashboard — coordinators mark attendance in seconds, students request leave without a WhatsApp thread, and admins see the whole cohort at a glance.
            </p>
            <div className="lp-hero-cta">
              <Button type="button" className="lp-btn-primary" onClick={handleLogin}>
                Login to your dashboard →
              </Button>
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
                  { label: 'Admin', value: '94%', tint: 'purple' },
                  { label: 'Coordinator', value: '86%', tint: 'blue' },
                  { label: 'Student', value: '91%', tint: 'green' },
                  { label: 'Permission', value: '72%', tint: 'orange' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`lp-mini-dashboard-card ${item.tint}`}
                  >
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
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
