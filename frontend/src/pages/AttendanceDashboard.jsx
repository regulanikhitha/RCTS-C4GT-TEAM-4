import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import TopBar from '../components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ChartContainer, ChartTooltipContent } from '../components/ui/chart';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Legend,
} from 'recharts';

const ROLES = ['All Members', 'Junior Developers', 'Senior Developers', 'Developer Interns'];
const ROLE_MAP = {
  'Junior Developers': 'Junior Developer',
  'Senior Developers': 'Senior Developer',
  'Developer Interns': 'Developer Intern',
};

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', weekday: 'long',
  });
}

export default function AttendanceDashboard() {
  const { adminSearch } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('All Members');
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const role = ROLE_MAP[activeTab];
      const params = new URLSearchParams({ date: selectedDate });
      if (role) params.set('role', role);
      const [attRes, statsRes] = await Promise.all([
        api.get(`/attendance?${params}`),
        api.get(`/attendance/stats?date=${selectedDate}`),
      ]);
      const allMembers = attRes.data.members || [];
      const searchQuery = (adminSearch || '').trim().toLowerCase();
      const filtered = searchQuery
        ? allMembers.filter((member) => {
            const haystack = [member.name, member.role, member.memberId, member.email].filter(Boolean).join(' ').toLowerCase();
            return haystack.includes(searchQuery);
          })
        : allMembers;
      setMembers(filtered);
      setStats({
        ...statsRes.data,
        totalMembers: filtered.length,
        present: filtered.filter((m) => m.status === 'Present').length,
        absent: filtered.filter((m) => m.status === 'Absent').length,
        attendancePercentage: filtered.length
          ? Math.round((filtered.filter((m) => m.status === 'Present').length / filtered.length) * 100)
          : 0,
      });
    } catch (_) {
      setMembers([]);
    } finally { setLoading(false); }
  }, [selectedDate, activeTab, adminSearch]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  const updateStatus = async (member, newStatus) => {
    if (!member.attendanceId) {
      // Create new record
      try {
        setUpdating(member.memberId);
        await api.post('/attendance', { memberId: member.memberId, date: selectedDate, status: newStatus });
        toast.success(`Marked ${newStatus}`);
        fetchAttendance();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed');
      } finally { setUpdating(null); }
    } else {
      try {
        setUpdating(member.attendanceId);
        await api.put(`/attendance/${member.attendanceId}`, { status: newStatus });
        toast.success(`Updated to ${newStatus}`);
        fetchAttendance();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed');
      } finally { setUpdating(null); }
    }
  };

  const markAll = async (status) => {
    try {
      const records = members.map(m => ({ memberId: m.memberId, status }));
      await api.post('/attendance/bulk', { date: selectedDate, records });
      toast.success(`Marked all as ${status}`);
      fetchAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk mark failed');
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await api.get(`/attendance/report/${selectedDate}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `C4GT_Attendance_${selectedDate}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const chartData = stats ? [
    { name: 'Junior Devs', present: stats.roleStats?.juniorDevelopers?.present ?? 0, absent: stats.roleStats?.juniorDevelopers?.absent ?? 0 },
    { name: 'Senior Devs', present: stats.roleStats?.seniorDevelopers?.present ?? 0, absent: stats.roleStats?.seniorDevelopers?.absent ?? 0 },
  ] : [];

  return (
    <>
      <TopBar title="Attendance Dashboard" />
      <div className="page-content">
        {/* Filters Row */}
        <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
          <div className="attendance-filters">
            {ROLES.map(r => (
              <button key={r} className={`tab-btn ${activeTab === r ? 'active' : ''}`} onClick={() => setActiveTab(r)}>
                {r}
              </button>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => changeDate(-1)}><ChevronLeft size={16} /></button>
              <input type="date" className="date-picker-input" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)} />
              <button className="btn btn-ghost btn-sm" onClick={() => changeDate(1)}><ChevronRight size={16} /></button>
            </div>
            <div className="bulk-actions">
              <button className="btn btn-success btn-sm" onClick={() => markAll('Present')}>
                <CheckCircle2 size={14} /> Mark All Present
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>
                <XCircle size={14} /> Mark All Absent
              </button>
              <button className="btn btn-outline btn-sm" onClick={downloadPDF}>
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            {adminSearch ? <span>Filtered by: <strong>"{adminSearch}"</strong></span> : <span>Attendance for <strong>{formatDate(selectedDate)}</strong></span>}
          </div>
        </div>

        {/* Main Table */}
        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-state"><div className="spinner" /><p>Loading attendance…</p></div>
            ) : members.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={40} />
                <h3>No members found</h3>
                <p>Try selecting a different date or role filter</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Role</th>
                    <th>Name</th>
                    <th>Roll No / ID</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.memberId}>
                      <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{i + 1}</td>
                      <td><span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.role}</span></td>
                      <td style={{ fontWeight: 600 }}>{m.name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--primary)' }}>{m.memberId}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {m.markedTime ? new Date(m.markedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${m.status?.toLowerCase() || 'unmarked'}`}>
                          {m.status || 'Unmarked'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button
                            className={`btn btn-sm ${m.status === 'Present' ? 'btn-success' : 'btn-outline'}`}
                            disabled={updating === (m.attendanceId || m.memberId)}
                            onClick={() => updateStatus(m, 'Present')}
                            title="Mark Present"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            className={`btn btn-sm ${m.status === 'Absent' ? 'btn-danger' : 'btn-outline'}`}
                            disabled={updating === (m.attendanceId || m.memberId)}
                            onClick={() => updateStatus(m, 'Absent')}
                            title="Mark Absent"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Summary Bar */}
          {stats && (
            <div className="attendance-summary">
              <div className="attendance-summary-cell">
                <div className="summary-label">Total Members</div>
                <div className="summary-value">{stats.totalMembers}</div>
              </div>
              <div className="attendance-summary-cell">
                <div className="summary-label">Present</div>
                <div className="summary-value green">{stats.present}</div>
              </div>
              <div className="attendance-summary-cell">
                <div className="summary-label">Absent</div>
                <div className="summary-value red">{stats.absent}</div>
              </div>
              <div className="attendance-summary-cell">
                <div className="summary-label">Attendance %</div>
                <div className="summary-value purple">{stats.attendancePercentage}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Recharts */}
        {chartData.length > 0 && (
          <Card className="chart-container">
            <CardHeader><CardTitle>Role-wise Attendance Breakdown</CardTitle></CardHeader>
            <CardContent>
            <ChartContainer config={{ present: { color: '#0f766e' }, absent: { color: '#e11d48' } }} height={200}>
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltipContent />
                <Legend />
                <Bar dataKey="present" name="Present" fill="var(--chart-present)" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="var(--chart-present)" />)}
                </Bar>
                <Bar dataKey="absent" name="Absent" fill="var(--chart-absent)" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill="var(--chart-absent)" />)}
                </Bar>
              </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
