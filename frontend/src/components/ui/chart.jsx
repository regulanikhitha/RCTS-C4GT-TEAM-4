import React from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const PRESENT_COLOR = '#0f766e';
const ABSENT_COLOR = '#e11d48';

export function ChartContainer({ config = {}, children, className = '', height = 260 }) {
  const variables = Object.entries(config).reduce((result, [key, value]) => {
    if (value?.color) result[`--chart-${key}`] = value.color;
    return result;
  }, {});

  return <div className={`chart-shell ${className}`} style={{ ...variables, height }}>{children}</div>;
}

function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;
  const displayLabel = item?.fullDate || label;
  const status = item?.status;

  return (
    <div className="chart-tooltip-card">
      <div className="chart-tooltip-label">{displayLabel}</div>
      {status ? (
        <div className="chart-tooltip-row">
          <span>
            <i style={{ background: status === 'Present' ? PRESENT_COLOR : ABSENT_COLOR }} />
            Attendance
          </span>
          <strong style={{ color: status === 'Present' ? PRESENT_COLOR : ABSENT_COLOR }}>
            {status}
          </strong>
        </div>
      ) : payload[0]?.payload ? (
        <div className="chart-tooltip-row">
          <span style={{ color: '#94a3b8' }}>No session recorded</span>
        </div>
      ) : payload.map((entry) => (
        <div className="chart-tooltip-row" key={entry.dataKey || entry.name}>
          <span><i style={{ background: entry.color }} />{entry.name}</span>
          <strong>{entry.value}</strong>
        </div>
      ))}
    </div>
  );
}

const animatedBarProps = {
  animationBegin: 80,
  animationDuration: 900,
  animationEasing: 'ease-out',
};

export function AttendanceBarChart({ data, showLegend = false }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: showLegend ? 8 : 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 36]} />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        {showLegend && (
          <Legend
            iconType="circle"
            wrapperStyle={{ color: '#64748b', fontSize: 12, paddingTop: 8 }}
          />
        )}
        <Bar dataKey="present" name="Present" fill={PRESENT_COLOR} radius={[5, 5, 0, 0]} maxBarSize={34} {...animatedBarProps} />
        <Bar dataKey="absent" name="Absent" fill={ABSENT_COLOR} radius={[5, 5, 0, 0]} maxBarSize={34} {...animatedBarProps} animationBegin={180} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AttendanceDoughnutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="66%"
          outerRadius="86%"
          paddingAngle={4}
          stroke="none"
          isAnimationActive
          animationBegin={100}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
        </Pie>
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function StraightXAxisTick({ x, y, payload }) {
  if (!payload || payload.value === undefined) return null;
  const val = String(payload.value);
  const parts = val.split(' ');
  if (parts.length > 1) {
    const [dayNum, subLabel] = parts;
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={12} textAnchor="middle" fill="#0f172a" fontSize={11} fontWeight={700}>
          {dayNum}
        </text>
        <text x={0} y={0} dy={25} textAnchor="middle" fill="#64748b" fontSize={9.5} fontWeight={600}>
          {subLabel}
        </text>
      </g>
    );
  }

  return (
    <text x={x} y={y} dy={14} textAnchor="middle" fill="#64748b" fontSize={11} fontWeight={600}>
      {val}
    </text>
  );
}

export function AttendanceTrendChart({ data, period = 'weekly' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 12 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          interval={0}
          minTickGap={0}
          tick={<StraightXAxisTick />}
          height={40}
        />
        <YAxis
          axisLine={false}
          domain={[0, 1]}
          ticks={[0, 1]}
          tickFormatter={(value) => (value === 1 ? ' ' : '')}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        <Bar dataKey="value" name="Attendance status" radius={[5, 5, 0, 0]} maxBarSize={period === 'monthly' ? 24 : 32} {...animatedBarProps}>
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${entry.name || idx}`}
              fill={entry.status === 'Present' ? PRESENT_COLOR : entry.status === 'Absent' ? ABSENT_COLOR : '#e2e8f0'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
