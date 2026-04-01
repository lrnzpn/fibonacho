'use client';

import { VoteAnalytics } from '@/types';

interface EnhancedStatisticsProps {
  analytics: VoteAnalytics;
}

export default function EnhancedStatistics({ analytics }: EnhancedStatisticsProps) {
  if (analytics.totalVotes === 0) {
    return null;
  }

  const distributionEntries = Object.entries(analytics.distribution)
    .sort(([a], [b]) => {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return bNum - aNum;
      }
      return b.localeCompare(a);
    })
    .map(([value, count]) => ({
      value,
      count,
      percentage: ((count / analytics.totalVotes) * 100).toFixed(0),
    }));

  const getMajorityUser = () => {
    if (!analytics.majority) return null;
    const majorityVotes = Object.entries(analytics.distribution).find(
      ([value]) => value === String(analytics.majority)
    );
    if (!majorityVotes || majorityVotes[1] === 1) return null;
    return null;
  };

  const getHighestUser = () => {
    if (analytics.highest === null) return null;
    return null;
  };

  const getLowestUser = () => {
    if (analytics.lowest === null) return null;
    return null;
  };

  return (
    <div className="space-y-6 rounded-2xl bg-[var(--surface)] p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[var(--text)]">Statistics</h3>

      {/* Horizontal Bar Chart */}
      <div className="space-y-2">
        {distributionEntries.map((entry, index) => (
          <div key={entry.value} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="relative h-10 overflow-hidden rounded-lg bg-[var(--background)]">
                <div
                  className="absolute inset-y-0 left-0 flex items-center justify-between px-3 transition-all duration-500"
                  style={{
                    width: `${entry.percentage}%`,
                    backgroundColor: index === 0 ? '#3b82f6' : '#6366f1',
                    minWidth: '60px',
                  }}
                >
                  <span className="font-mono text-sm font-bold text-white">{entry.value}</span>
                  <span className="text-xs font-semibold text-white/90">{entry.percentage}%</span>
                </div>
                {Number(entry.percentage) < 15 && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      {entry.percentage}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-3 border-t border-[var(--background)] pt-4">
        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text-muted)]">Majority</span>
          <div className="flex items-center gap-2">
            {analytics.majority !== null && (
              <>
                <span className="font-mono text-lg font-bold text-[var(--text)]">
                  {analytics.majority}
                </span>
                {getMajorityUser() && (
                  <span className="text-xs text-[var(--text-muted)]">({getMajorityUser()})</span>
                )}
              </>
            )}
            {analytics.majority === null && (
              <span className="text-sm text-[var(--text-muted)]">No consensus</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text-muted)]">Average</span>
          <span className="font-mono text-lg font-bold text-[var(--text)]">
            {analytics.average ?? '-'}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text-muted)]">Highest</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-[var(--text)]">
              {analytics.highest ?? '-'}
            </span>
            {getHighestUser() && (
              <span className="text-xs text-[var(--text-muted)]">({getHighestUser()})</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-[var(--background)] px-4 py-3">
          <span className="text-sm font-semibold text-[var(--text-muted)]">Lowest</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-[var(--text)]">
              {analytics.lowest ?? '-'}
            </span>
            {getLowestUser() && (
              <span className="text-xs text-[var(--text-muted)]">({getLowestUser()})</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
