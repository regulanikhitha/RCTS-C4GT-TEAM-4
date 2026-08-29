import React, { useState } from 'react';
import TopBar from '../components/TopBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const today = new Date();
  const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });

  const firstDay = new Date(current.year, current.month, 1).getDay();
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setCurrent(c => c.month === 0 ? { month: 11, year: c.year - 1 } : { month: c.month - 1, year: c.year });
  const next = () => setCurrent(c => c.month === 11 ? { month: 0, year: c.year + 1 } : { month: c.month + 1, year: c.year });

  return (
    <>
      <TopBar title="Calendar" />
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
                return (
                  <div key={i} style={{
                    aspectRatio: '1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: 13, fontWeight: day ? 500 : 400,
                    cursor: day ? 'pointer' : 'default',
                    background: isToday ? 'var(--primary)' : 'transparent',
                    color: isToday ? 'white' : day ? 'var(--text-primary)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { if (day && !isToday) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (day && !isToday) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
