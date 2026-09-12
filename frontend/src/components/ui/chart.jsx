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

  return (
    <div className="chart-tooltip-card">
      <div className="chart-tooltip-label">{label}</div>
      {payload[0]?.payload?.status ? (
        <div className="chart-tooltip-row">
          <span><i style={{ background: payload[0].payload.status === 'Present' ? PRESENT_COLOR : ABSENT_COLOR }} />Status</span>
          <strong>{payload[0].payload.status}</strong>
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
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
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

export function AttendanceTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 18 }}>
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 10 }}
          interval={data.length > 14 ? 2 : 0}
          angle={data.length > 14 ? -35 : 0}
          textAnchor={data.length > 14 ? 'end' : 'middle'}
          height={data.length > 14 ? 42 : 24}
        />
        <YAxis
          axisLine={false}
          domain={[0, 1]}
          ticks={[0, 1]}
          tickFormatter={(value) => (value === 1 ? 'Recorded' : '')}
          tickLine={false}
          tick={{ fill: '#64748b', fontSize: 11 }}
        />
        <Tooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
        <Bar dataKey="value" name="Attendance status" radius={[5, 5, 0, 0]} maxBarSize={28} {...animatedBarProps}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.status === 'Present' ? PRESENT_COLOR : ABSENT_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
