'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface VoteChartProps {
  distribution: Record<string, number>;
  totalVotes: number;
}

interface ChartDataItem {
  value: string;
  count: number;
  percentage: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataItem;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--surface)] p-3 shadow-xl">
        <p className="font-mono text-lg font-bold text-[var(--text)]">{data.value}</p>
        <p className="text-sm text-[var(--text-muted)]">
          {payload[0].value} votes ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function VoteChart({ distribution, totalVotes }: VoteChartProps) {
  if (totalVotes === 0) {
    return (
      <div className="rounded-2xl bg-[var(--surface)] px-6 py-16 text-center shadow-lg">
        <p className="text-lg text-[var(--text-muted)]">No votes yet</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData: ChartDataItem[] = Object.entries(distribution)
    .sort(([a], [b]) => {
      // Sort numerically for numbers, alphabetically for special cards
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      return a.localeCompare(b);
    })
    .map(([value, count]) => ({
      value,
      count,
      percentage: ((count / totalVotes) * 100).toFixed(1),
    }));

  return (
    <div className="rounded-2xl bg-[var(--surface)] p-6 shadow-lg">
      <h3 className="mb-6 text-center text-lg font-bold text-[var(--text)]">Vote Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--text-muted)" opacity={0.1} />
          <XAxis
            dataKey="value"
            tick={{ fill: 'var(--text)', fontSize: 14, fontWeight: 600 }}
            axisLine={{ stroke: 'var(--text-muted)', opacity: 0.3 }}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--text-muted)', opacity: 0.3 }}
            allowDecimals={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'var(--accent-primary)', opacity: 0.1 }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={80}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {chartData.map((entry, index) => (
          <div
            key={entry.value}
            className="flex items-center gap-2 rounded-lg bg-[var(--background)] p-2"
          >
            <div
              className="h-4 w-4 flex-shrink-0 rounded"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-[var(--text)]">
                  {entry.value}
                </span>
                <span className="text-xs text-[var(--text-muted)]">({entry.count})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
