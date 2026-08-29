import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const sectionIds = ['home', 'about', 'roles', 'contact'];

export default function Landing() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  const navItems = useMemo(
    () => [
      { id: 'home', label: 'Home' },
      { id: 'about', label: 'About' },
      { id: 'roles', label: 'Roles' },
      { id: 'contact', label: 'Contact' },
    ],
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: '-35% 0px -45% 0px',
        threshold: [0.2, 0.5, 0.8],
      }
    );

    sectionIds.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToDashboard = () => {
    const demoUser = {
      name: 'Admin User',
      email: 'admin@c4gt.com',
      role: 'admin',
    };

    localStorage.setItem('c4gt_user', JSON.stringify(demoUser));
    localStorage.setItem('c4gt_token', 'demo-admin-token');
    toast.success('Welcome back!');
    navigate('/admin-dashboard');
  };

  const handleLogin = () => {
    goToDashboard();
  };

  const handleDashboardCardClick = (route) => {
    goToDashboard();
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

      <nav className="lp-side-nav" aria-label="Section navigation">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={`lp-side-link ${activeSection === id ? 'active' : ''}`}
            data-target={id}
            onClick={() => scrollToSection(id)}
            aria-label={label}
          >
            <span className="lp-side-dot" />
            <span className="lp-side-label">{label}</span>
          </button>
        ))}
      </nav>

      <header className="lp-nav">
        <button type="button" className="lp-brand" onClick={goToDashboard}>
          <div className="lp-brand-badge">
            <svg viewBox="0 0 40 40" width="36" height="36" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="20" fill="url(#lp-grad)" />
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fill="white">C4</text>
              <defs>
                <linearGradient id="lp-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" />
                  <stop offset="0.5" stopColor="#ef4444" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="lp-brand-text">
            <span className="brand">C4GT HUB</span>
            <span className="sub">@KIET</span>
          </span>
        </button>

        <nav className="lp-nav-links" aria-label="Main menu">
          {navItems.slice(1).map(({ id, label }) => (
            <button key={id} type="button" className="lp-nav-link" onClick={() => scrollToSection(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="lp-nav-right">
          <button type="button" className="lp-btn-login" onClick={handleLogin}>
            Login →
          </button>
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

        <section className="lp-section" id="about">
          <div className="lp-section-head">
            <span className="lp-kicker">What&apos;s inside</span>
            <h2>Everything a cohort needs, nothing it doesn&apos;t</h2>
            <p>Four modules cover the day-to-day of running C4GT Hub — from marking who showed up to explaining why someone didn&apos;t.</p>
          </div>

          <div className="lp-grid-4">
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#4338ca' }}>✓</div>
              <h3>Attendance Tracking</h3>
              <p>Mark and review daily attendance across all 9 teams in a couple of clicks.</p>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#f59e0b' }}>📄</div>
              <h3>Permission Portal</h3>
              <p>Members request leave; coordinators and admins approve or reject with a paper trail.</p>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#ef4444' }}>👥</div>
              <h3>Member Directory</h3>
              <p>Every intern, senior developer and lead in one searchable, filterable roster.</p>
            </div>
            <div className="lp-feature">
              <div className="lp-feature-icon" style={{ background: '#8b5cf6' }}>📊</div>
              <h3>Reports &amp; Analytics</h3>
              <p>Team-wise attendance charts and exportable PDF reports, generated on demand.</p>
            </div>
          </div>
        </section>

        <section className="lp-section lp-alt" id="roles">
          <div className="lp-section-head">
            <span className="lp-kicker">Sign in as</span>
            <h2>A dashboard tuned to each role</h2>
            <p>The same platform, three different views — everyone sees exactly what they need to do their part.</p>
          </div>

          <div className="lp-grid-3">
            <div className="lp-role">
              <span className="lp-role-tag" style={{ background: '#ede9fe', color: '#6d28d9' }}>Admin</span>
              <h3>Full system access</h3>
              <ul>
                <li>View and manage all 81 members</li>
                <li>Approve or reject any permission request</li>
                <li>Add, edit, or remove member records</li>
                <li>Generate reports and view audit logs</li>
              </ul>
            </div>

            <div className="lp-role">
              <span className="lp-role-tag" style={{ background: '#fef3c7', color: '#b45309' }}>Coordinator</span>
              <h3>Team oversight</h3>
              <ul>
                <li>Mark attendance for their team</li>
                <li>Review and action permission requests</li>
                <li>Manage team member details</li>
                <li>View attendance reports for their team</li>
              </ul>
            </div>

            <div className="lp-role">
              <span className="lp-role-tag" style={{ background: '#dcfce7', color: '#15803d' }}>Student</span>
              <h3>Personal workspace</h3>
              <ul>
                <li>View their own attendance history</li>
                <li>Submit permission requests</li>
                <li>Check the shared team calendar</li>
                <li>Keep their profile up to date</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-section" id="contact">
          <div className="lp-contact-grid">
            <div className="lp-contact-info">
              <span className="lp-kicker">Get in touch</span>
              <h2>Questions about your access?</h2>
              <p>Locked out, missing from the roster, or not sure which role you should have? Reach the C4GT Hub coordinators below, or send a note through the form.</p>

              <div className="lp-contact-row">
                <div className="lp-contact-icon">✉</div>
                <div>
                  <strong>hub@c4gt-kiet.org</strong>
                  <span>General support</span>
                </div>
              </div>
              <div className="lp-contact-row">
                <div className="lp-contact-icon">🛡</div>
                <div>
                  <strong>Admin desk</strong>
                  <span>Account &amp; access issues</span>
                </div>
              </div>
              <div className="lp-contact-row">
                <div className="lp-contact-icon">📍</div>
                <div>
                  <strong>KIET Group of Institutions</strong>
                  <span>Correlation Cell, C4GT Program</span>
                </div>
              </div>
            </div>

            <form className="lp-form" onSubmit={handleSubmit}>
              <div className="lp-form-row">
                <div>
                  <label>Your name</label>
                  <input required placeholder="Jane Doe" />
                </div>
                <div>
                  <label>Email</label>
                  <input required type="email" placeholder="you@kiet.edu" />
                </div>
              </div>
              <div className="lp-form-field">
                <label>Message</label>
                <textarea required placeholder="Tell us what you need help with…" />
              </div>
              <button type="submit" className="lp-form-submit">
                Send message
              </button>
              <p className="lp-form-hint">We typically reply within one working day.</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="20" fill="url(#lp-grad-2)" />
              <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fill="white">C4</text>
              <defs>
                <linearGradient id="lp-grad-2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f59e0b" />
                  <stop offset="0.5" stopColor="#ef4444" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            C4GT HUB @KIET
          </div>
          <small>© 2026 C4GT Hub Attendance Management System</small>
        </div>
      </footer>
    </div>
  );
}
