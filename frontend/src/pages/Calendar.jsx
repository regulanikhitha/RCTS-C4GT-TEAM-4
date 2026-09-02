import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

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
          records[record.date] = record.status;
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

  return (
    <>
      <TopBar title="Calendar" hideSearch />
      <div className="page-content">
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card-header">
            <button className="btn btn-ghost btn-sm" onClick={prev}><ChevronLeft size={16} /></button>
            <span className="card-title">{MONTHS[current.month]} {current.year}</span>
            <button className="btn btn-ghost btn-sm" onClick={next}><ChevronRight size={16} /></button>
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
                const attendanceStatus = dateKey ? attendanceByDate[dateKey] : null;
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
                    fontSize: 13, fontWeight: day ? 500 : 400,
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
      </div>
    </>
  );
}
