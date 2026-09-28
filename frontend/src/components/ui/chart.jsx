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

export function ChartTooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const firstEntry = payload[0];
  const item = firstEntry?.payload || {};

  // Case 1: Student Trend Day Record (Weekly / Monthly trend bar chart)
  const isTrendItem = Boolean(
    item.isTrendDay ||
    item.fullDate ||
    ('status' in item && ('dayNum' in item || 'monthName' in item || 'weekday' in item))
  );

  if (isTrendItem) {
    const displayDate = item.fullDate || label || item.name;
    const status = item.status;
    const isPresent = status === 'Present';
    const isAbsent = status === 'Absent';
    const hasSession = isPresent || isAbsent;

    if (item.isUpcoming) {
      return (
        <div className="chart-tooltip-card">
          <div className="chart-tooltip-label">{displayDate}</div>
          <div className="chart-tooltip-row">
            <span>
              <i style={{ background: '#cbd5e1' }} />
              Status
            </span>
            <strong style={{ color: '#94a3b8' }}>
              Upcoming day
            </strong>
          </div>
        </div>
      );
    }

    return (
      <div className="chart-tooltip-card">
        <div className="chart-tooltip-label">{displayDate}</div>
        {hasSession ? (
          <div className="chart-tooltip-row">
            <span>
              <i style={{ background: isPresent ? PRESENT_COLOR : ABSENT_COLOR }} />
              Attendance
            </span>
            <strong style={{ color: isPresent ? PRESENT_COLOR : ABSENT_COLOR }}>
              {status}
            </strong>
          </div>
        ) : (
          <div className="chart-tooltip-row">
            <span>
              <i style={{ background: '#94a3b8' }} />
              Status
            </span>
            <strong style={{ color: '#94a3b8' }}>
              No session recorded
            </strong>
          </div>
        )}
      </div>
    );
  }

  // Case 2: Pie / Doughnut Chart slice (e.g. Present vs Absent status mix)
  if (item._empty || item.name === 'No records') {
    return (
      <div className="chart-tooltip-card">
        <div className="chart-tooltip-label">Attendance Overview</div>
        <div className="chart-tooltip-row">
          <span style={{ color: '#94a3b8' }}>No records recorded yet</span>
        </div>
      </div>
    );
  }

  const isPieSlice = payload.length === 1 && !firstEntry.dataKey && (item.name || firstEntry.name);
  if (isPieSlice) {
    const sliceName = firstEntry.name || item.name;
    const sliceValue = Number(firstEntry.value ?? item.value ?? 0);
    const sliceColor = item.color || firstEntry.color || (sliceName === 'Present' ? PRESENT_COLOR : ABSENT_COLOR);
    const total = item._total;
    const percent = total > 0 ? Math.round((sliceValue / total) * 100) : null;

    return (
      <div className="chart-tooltip-card">
        <div className="chart-tooltip-label">{sliceName}</div>
        <div className="chart-tooltip-row">
          <span>
            <i style={{ background: sliceColor }} />
            Count
          </span>
          <strong style={{ color: sliceColor }}>
            {sliceValue} {percent !== null ? `(${percent}%)` : ''}
          </strong>
        </div>
      </div>
    );
  }

  // Case 3: Bar Chart (e.g. Role-wise attendance with Present & Absent bars)
  const displayTitle = label || item.name || 'Attendance';
  const presentVal = typeof item.present === 'number' ? item.present : null;
  const absentVal = typeof item.absent === 'number' ? item.absent : null;
  const hasPresentAbsent = presentVal !== null && absentVal !== null;
  const totalInRole = hasPresentAbsent ? presentVal + absentVal : null;
  const attendanceRate = totalInRole && totalInRole > 0 ? Math.round((presentVal / totalInRole) * 100) : null;

  return (
    <div className="chart-tooltip-card">
      <div className="chart-tooltip-label">{displayTitle}</div>
      {payload.map((entry) => {
        const entryName = entry.name || (entry.dataKey === 'present' ? 'Present' : entry.dataKey === 'absent' ? 'Absent' : entry.dataKey);
        const entryColor = entry.color || (entry.dataKey === 'present' ? PRESENT_COLOR : ABSENT_COLOR);
        const entryVal = entry.value ?? 0;

        return (
          <div className="chart-tooltip-row" key={entry.dataKey || entryName}>
            <span>
              <i style={{ background: entryColor }} />
              {entryName}
            </span>
            <strong style={{ color: entryColor }}>
              {entryVal}
            </strong>
          </div>
        );
      })}

      {hasPresentAbsent && totalInRole > 0 && (
        <div
          className="chart-tooltip-row"
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid #f1f5f9',
            fontSize: '11px',
          }}
        >
          <span style={{ color: '#64748b' }}>Attendance Rate</span>
          <strong style={{ color: attendanceRate >= 75 ? PRESENT_COLOR : ABSENT_COLOR }}>
            {attendanceRate}%
          </strong>
        </div>
      )}
    </div>
  );
}

const animatedBarProps = {
  animationBegin: 80,
  animationDuration: 900,
  animationEasing: 'ease-out',
};

export function AttendanceBarChart({ data = [], showLegend = false }) {
  const maxValue = React.useMemo(() => {
    if (!data || !data.length) return 10;
    const max = Math.max(
      ...data.map((d) => Math.max(Number(d.present || 0), Number(d.absent || 0)))
    );
    return Math.max(max + 2, 5);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: showLegend ? 8 : 0 }}>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
        <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, maxValue]} />
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

export function AttendanceDoughnutChart({ data = [] }) {
  const total = (data || []).reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const chartData = (data || []).map((d) => ({ ...d, _total: total }));
  const hasData = total > 0;
  const displayData = hasData
    ? chartData.filter((d) => Number(d.value) > 0)
    : [{ name: 'No records', value: 1, color: '#e2e8f0', _empty: true }];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={displayData}
          dataKey="value"
          nameKey="name"
          innerRadius="66%"
          outerRadius="86%"
          paddingAngle={hasData && displayData.length > 1 ? 4 : 0}
          stroke="none"
          isAnimationActive
          animationBegin={100}
          animationDuration={1000}
          animationEasing="ease-out"
        >
          {displayData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
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

export function AttendanceTrendChart({ data = [], period = 'weekly' }) {
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
