import React, { useEffect, useState, useMemo } from 'react';
import TopBar from '../components/TopBar';
import { ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const { user } = useAuth();
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
  const [attendanceByDate, setAttendanceByDate] = useState({});

  useEffect(() => {
    if (user?.role !== 'student') return;

    const studentIdentifier = user.memberId || user.email;
    if (!studentIdentifier) return;

    api.get(`/attendance/member/${encodeURIComponent(studentIdentifier)}`)
      .then(({ data }) => {
        const recordsByDate = (data.records || []).reduce((records, record) => {
          const dateStr = record.date ? String(record.date).slice(0, 10) : '';
          if (dateStr) {
            records[dateStr] = record.status;
          }
          return records;
        }, {});
        setAttendanceByDate(recordsByDate);
      })
      .catch(() => setAttendanceByDate({}));
  }, [user]);

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setCurrent(c => c.month === 0 ? { month: 11, year: c.year - 1 } : { month: c.month - 1, year: c.year });
  const next = () => setCurrent(c => c.month === 11 ? { month: 0, year: c.year + 1 } : { month: c.month + 1, year: c.year });

  // Selected Month Attendance Stats
  const selectedMonthStats = useMemo(() => {
    let present = 0;
    let absent = 0;

    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      if (dateKey > todayKey) continue;
      const status = attendanceByDate[dateKey];
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
    }

    const total = present + absent;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const pieData = [
      { name: 'Present', value: present, color: '#16a34a' },
      { name: 'Absent', value: absent, color: '#dc2626' },
    ];

    return { present, absent, total, percentage, pieData };
  }, [current, daysInMonth, attendanceByDate]);

  return (
    <>
      <TopBar title="Calendar" hideSearch />
      <div className="page-content">
        <div className="calendar-page-grid">
          {/* Calendar Card */}
          <div className="card calendar-main-card">
            <div className="card-header">
              <Button variant="ghost" className="btn btn-ghost btn-sm" onClick={prev}><ChevronLeft size={16} /></Button>
              <span className="card-title">{MONTHS[current.month]} {current.year}</span>
              <Button variant="ghost" className="btn btn-ghost btn-sm" onClick={next}><ChevronRight size={16} /></Button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {DAYS.map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                {cells.map((day, i) => {
                  const isToday = day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
                  const dateKey = day
                    ? `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                    : null;
                  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  const isFuture = dateKey ? dateKey > todayKey : false;
                  const attendanceStatus = (dateKey && !isFuture) ? attendanceByDate[dateKey] : null;
                  const attendanceColor = attendanceStatus === 'Present'
                    ? '#16a34a'
                    : attendanceStatus === 'Absent'
                      ? '#dc2626'
                      : null;
                  return (
                    <div key={i} style={{
                      aspectRatio: '1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: '50%',
                      fontSize: 13, fontWeight: day ? 600 : 400,
                      cursor: day ? 'pointer' : 'default',
                      background: attendanceColor || (isToday ? 'var(--primary)' : 'transparent'),
                      color: attendanceColor || isToday ? 'white' : day ? 'var(--text-primary)' : 'transparent',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => { if (day && !attendanceColor && !isToday) e.currentTarget.style.background = 'var(--bg)'; }}
                      onMouseLeave={e => { if (day && !attendanceColor && !isToday) e.currentTarget.style.background = 'transparent'; }}
                      title={attendanceStatus ? `${attendanceStatus} on ${dateKey}` : undefined}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              {user?.role === 'student' && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 18, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#16a34a', marginRight: 6 }} />Present</span>
                  <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#dc2626', marginRight: 6 }} />Absent</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Month Attendance Pie Chart Card */}
          <div className="card calendar-analytics-card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="card-title">
                {MONTHS[current.month]} Attendance
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                {current.year}
              </span>
            </div>

            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {selectedMonthStats.total > 0 ? (
                <>
                  <div style={{ position: 'relative', width: '100%', height: 210 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={selectedMonthStats.pieData.filter((d) => d.value > 0)}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="65%"
                          outerRadius="88%"
                          paddingAngle={selectedMonthStats.present > 0 && selectedMonthStats.absent > 0 ? 4 : 0}
                          stroke="none"
                          isAnimationActive
                        >
                          {selectedMonthStats.pieData.filter((d) => d.value > 0).map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} Day${value !== 1 ? 's' : ''}`, name]}
                          contentStyle={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none',
                    }}>
                      <strong style={{ fontSize: 26, fontWeight: 800, color: '#1e293b' }}>
                        {selectedMonthStats.percentage}%
                      </strong>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Attendance
                      </span>
                    </div>
                  </div>

                  {/* Summary Indicators */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 6, fontSize: 13 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#15803d', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }} />
                      Present: {selectedMonthStats.present}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b91c1c', fontWeight: 700 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} />
                      Absent: {selectedMonthStats.absent}
                    </span>
                  </div>

                  {/* Monthly stats breakdown */}
                  <div style={{
                    width: '100%',
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: '14px 16px',
                    marginTop: 18,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    border: '1px solid #e2e8f0',
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Tracked Sessions
                      </span>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                        {selectedMonthStats.total} {selectedMonthStats.total === 1 ? 'day' : 'days'}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Standing
                      </span>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: selectedMonthStats.percentage >= 75 ? '#15803d' : '#ea580c',
                        marginTop: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}>
                        {selectedMonthStats.percentage >= 75 ? (
                          <><CheckCircle2 size={15} /> Good Standing</>
                        ) : (
                          <><AlertCircle size={15} /> Below 75%</>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '36px 16px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 280,
                }}>
                  <div style={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    border: '6px dashed #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}>
                    <CalendarIcon size={26} color="#94a3b8" />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 700, marginTop: 4 }}>No Records</span>
                  </div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
                    No Records for {MONTHS[current.month]} {current.year}
                  </h4>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0, maxWidth: 220 }}>
                    Use the calendar arrows to navigate to active months.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
