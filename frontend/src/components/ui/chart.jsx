import React from 'react';
import { Tooltip } from 'recharts';

export function ChartContainer({ config = {}, children, className = '', height = 260 }) {
  const variables = Object.entries(config).reduce((result, [key, value]) => {
    if (value?.color) result[`--chart-${key}`] = value.color;
    return result;
  }, {});

  return <div className={`chart-shell ${className}`} style={{ ...variables, height }}>{children}</div>;
}

export function ChartTooltipContent({ formatter, labelFormatter }) {
  return (
    <Tooltip
      cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
      content={({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
          <div className="chart-tooltip-card">
            <div className="chart-tooltip-label">{labelFormatter ? labelFormatter(label) : label}</div>
            {payload.map((entry) => (
              <div className="chart-tooltip-row" key={entry.dataKey}>
                <span><i style={{ background: entry.color }} />{entry.name}</span>
                <strong>{formatter ? formatter(entry.value, entry.name) : entry.value}</strong>
              </div>
            ))}
          </div>
        );
      }}
    />
  );
}
