'use client';

interface VoteChartProps {
  distribution: Record<string, number>;
  totalVotes: number;
}

export default function VoteChart({ distribution, totalVotes }: VoteChartProps) {
  if (totalVotes === 0) return null;

  const entries = Object.entries(distribution).sort(([a], [b]) => {
    const numA = a === '?' || a === '☕' ? Infinity : Number(a);
    const numB = b === '?' || b === '☕' ? Infinity : Number(b);
    return numA - numB;
  });

  const colors = [
    '#facc15', // yellow
    '#fb923c', // orange
    '#f97316', // deep orange
    '#eab308', // amber
    '#fbbf24', // light yellow
    '#f59e0b', // orange-500
    '#d97706', // orange-600
  ];

  const slices = entries.reduce<{ slices: React.JSX.Element[]; currentAngle: number }>(
    (acc, [value, count], index) => {
      const percentage = (count / totalVotes) * 100;
      const angle = (percentage / 100) * 360;
      const endAngle = acc.currentAngle + angle;

      const startRad = (acc.currentAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 100 + 90 * Math.cos(startRad);
      const y1 = 100 + 90 * Math.sin(startRad);
      const x2 = 100 + 90 * Math.cos(endRad);
      const y2 = 100 + 90 * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const pathData = [
        `M 100 100`,
        `L ${x1} ${y1}`,
        `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(' ');

      const slice = (
        <g key={value}>
          <path
            d={pathData}
            fill={colors[index % colors.length]}
            stroke="var(--background)"
            strokeWidth="2"
            className="transition-all hover:opacity-80"
          />
          {percentage > 5 && (
            <text
              x={100 + 60 * Math.cos((((acc.currentAngle + endAngle) / 2) * Math.PI) / 180)}
              y={100 + 60 * Math.sin((((acc.currentAngle + endAngle) / 2) * Math.PI) / 180)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--background)] font-mono text-sm font-bold"
            >
              {value}
            </text>
          )}
        </g>
      );

      return {
        slices: [...acc.slices, slice],
        currentAngle: endAngle,
      };
    },
    { slices: [], currentAngle: -90 }
  );

  return (
    <div className="rounded-xl bg-[var(--surface)] p-4 shadow-lg md:p-6">
      <h3 className="mb-4 text-lg font-bold text-[var(--text)] md:mb-6 md:text-xl">
        Vote Distribution
      </h3>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Pie Chart */}
        <div className="flex justify-center lg:justify-start">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="h-48 w-48 transform md:h-52 md:w-52"
          >
            {slices.slices}

            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="45" fill="var(--background)" />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="fill-[var(--text)] text-xs font-semibold tracking-wide uppercase"
            >
              Total
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="fill-[var(--accent-primary)] font-mono text-2xl font-bold"
            >
              {totalVotes}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3">
          {entries.map(([value, count], index) => {
            const percentage = ((count / totalVotes) * 100).toFixed(1);
            return (
              <div key={value} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="font-mono text-lg font-bold text-[var(--text)]">{value}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[var(--text-muted)]">
                    {count} vote{count !== 1 ? 's' : ''}
                  </span>
                  <span className="min-w-[3.5rem] text-right font-mono text-base font-bold text-[var(--accent-primary)]">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
