import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Percent, ClipboardList, FileText, UserPlus, Download } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChartContainer, ChartTooltipContent } from '../components/ui/chart';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const TODAY = new Date().toISOString().split('T')[0];

export default function Dashboard() {
  const { user, adminSearch } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, dailyRes] = await Promise.all([
        api.get(`/attendance/stats?date=${TODAY}`),
        api.get(`/attendance?date=${TODAY}`),
      ]);
      setStats(statsRes.data);
      setDailyData(dailyRes.data);
    } catch (_) {
      // silently fail — backend may not be running
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const searchQuery = (adminSearch || '').trim().toLowerCase();
  const visibleMembers = dailyData?.members?.filter((m) => {
    if (!searchQuery) return true;
    const haystack = [m.name, m.role, m.memberId, m.email].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(searchQuery);
  }) || [];

  const roleRows = visibleMembers.length ? (() => {
    const roles = {};
    visibleMembers.forEach(m => {
      const r = m.role || 'Unknown';
      if (!roles[r]) roles[r] = { total: 0, present: 0, absent: 0 };
      roles[r].total++;
      if (m.status === 'Present') roles[r].present++;
      if (m.status === 'Absent') roles[r].absent++;
    });
    return Object.entries(roles);
  })() : [];

  const filteredStats = searchQuery
    ? {
        totalMembers: visibleMembers.length,
        present: visibleMembers.filter((m) => m.status === 'Present').length,
        absent: visibleMembers.filter((m) => m.status === 'Absent').length,
        attendancePercentage: visibleMembers.length
          ? Math.round((visibleMembers.filter((m) => m.status === 'Present').length / visibleMembers.length) * 100)
          : 0,
      }
    : stats;

  const QUICK = [
    { icon: <ClipboardList size={18} />, title: 'Mark Attendance', sub: 'Mark present or absent', color: 'purple', to: '/attendance' },
    { icon: <FileText size={18} />, title: 'Permission Dashboard', sub: 'View & approve requests', color: 'blue', to: '/permission-dashboard' },
    { icon: <UserPlus size={18} />, title: 'Coordinator Dashboard', sub: 'Review team operations', color: 'green', to: '/coordinator-dashboard' },
    { icon: <Download size={18} />, title: 'Student Dashboard', sub: 'Track learner activity', color: 'orange', to: '/student-dashboard' },
  ];

  const chartData = roleRows.map(([role, data]) => ({ name: role, present: data.present, absent: data.absent }));
  const statusData = [
    { name: 'Present', value: filteredStats?.present ?? 0, color: '#0f766e' },
    { name: 'Absent', value: filteredStats?.absent ?? 0, color: '#e11d48' },
  ];

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="page-content">
        <div className="page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Coordinator'}! 👋</h1>
          <p>Here's what's happening in C4GT Hub today.</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard icon={<Users size={22} color="#2563eb" />} label="Total Members"
            value={loading ? '–' : (filteredStats?.totalMembers ?? 0)} sub={searchQuery ? 'Filtered results' : 'All Registered Members'} colorClass="blue" />
          <StatCard icon={<UserCheck size={22} color="#16a34a" />} label="Present Today"
            value={loading ? '–' : (filteredStats?.present ?? 0)} sub="Today's Attendance" colorClass="green" />
          <StatCard icon={<UserX size={22} color="#dc2626" />} label="Absent Today"
            value={loading ? '–' : (filteredStats?.absent ?? 0)} sub="Today's Absence" colorClass="red" />
          <StatCard icon={<Percent size={22} color="#7c3aed" />} label="Attendance %"
            value={loading ? '–' : `${filteredStats?.attendancePercentage ?? 0}%`}
            sub={searchQuery ? 'Filtered attendance' : "Today's Percentage"} colorClass="purple" />
        </div>

        <div className="dashboard-grid">
          {/* Left: Today's Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance Overview</CardTitle>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {searchQuery ? `Filtered by: "${adminSearch}"` : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/attendance')}>View All</button>
              </div>
            </CardHeader>
            <CardContent className="table-wrap">
              {loading ? (
                <div className="loading-state"><div className="spinner" /><p>Loading attendance…</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Total Members</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance %</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleRows.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No attendance data yet today</td></tr>
                    ) : (
                      <>
                        {roleRows.map(([role, d]) => {
                          const pct = d.total > 0 ? ((d.present / d.total) * 100).toFixed(1) : 0;
                          const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
                          return (
                            <tr key={role}>
                              <td><span style={{ fontWeight: 600 }}>{role}</span></td>
                              <td>{d.total}</td>
                              <td style={{ color: '#16a34a', fontWeight: 600 }}>{d.present}</td>
                              <td style={{ color: '#dc2626', fontWeight: 600 }}>{d.absent}</td>
                              <td style={{ fontWeight: 700, color }}>{pct}%</td>
                              <td>
                                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, width: 80, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        <tr style={{ background: '#f8fafc' }}>
                          <td style={{ fontWeight: 700 }}>Total</td>
                          <td style={{ fontWeight: 700 }}>{filteredStats?.totalMembers ?? 0}</td>
                          <td style={{ fontWeight: 700, color: '#16a34a' }}>{filteredStats?.present ?? 0}</td>
                          <td style={{ fontWeight: 700, color: '#dc2626' }}>{filteredStats?.absent ?? 0}</td>
                          <td style={{ fontWeight: 700 }}>{filteredStats?.attendancePercentage ?? 0}%</td>
                          <td />
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Right: Quick Actions */}
          <div>
            <Card style={{ marginBottom: 16 }}>
              <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
              <CardContent style={{ padding: '12px 16px' }}>
                <div className="quick-actions">
                  {QUICK.map(q => (
                    <div key={q.title} className="quick-action-item" onClick={() => navigate(q.to)}>
                      <div className={`qa-icon ${q.color}`}>{q.icon}</div>
                      <div className="qa-text">
                        <div className="qa-title">{q.title}</div>
                        <div className="qa-sub">{q.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar mini-summary */}
            <Card>
              <CardHeader><CardTitle>Today's Date</CardTitle></CardHeader>
              <CardContent style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                  {new Date().getDate()}
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ marginTop: 16, fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>
                  {filteredStats?.attendancePercentage ?? 0}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Attendance Today</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="dashboard-chart-grid">
          <Card>
            <CardHeader><CardTitle>Attendance by role</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{ present: { color: '#0f766e' }, absent: { color: '#e11d48' } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <ChartTooltipContent />
                    <Bar dataKey="present" name="Present" fill="var(--chart-present)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" name="Absent" fill="var(--chart-absent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Today's status mix</CardTitle></CardHeader>
            <CardContent className="donut-card-content">
              <ChartContainer config={{ present: { color: '#0f766e' }, absent: { color: '#e11d48' } }} height={220}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={84} paddingAngle={4} stroke="none">
                      {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <ChartTooltipContent />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-total"><strong>{filteredStats?.attendancePercentage ?? 0}%</strong><span>attendance</span></div>
              </ChartContainer>
              <div className="chart-legend">
                {statusData.map((entry) => <span key={entry.name}><i style={{ background: entry.color }} />{entry.name} <strong>{entry.value}</strong></span>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
