'use client';

import { useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom, clearVotes } from '@/lib/firebase/firestore';
import { calculateVoteAnalytics } from '@/lib/utils/analytics';

export default function VotingResults() {
  const context = useContext(RoomContext);
  const { user } = useAuth();

  if (!context || !user) {
    return null;
  }

  const { room, participants, votes } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';

  const voters = participants.filter((p) => p.role === 'voter' || p.role === 'moderator');
  const voterVotes = votes.filter((v) => voters.some((voter) => voter.uid === v.userId));

  const allVoted = voters.length > 0 && voterVotes.length === voters.length;
  const analytics = calculateVoteAnalytics(votes);

  const handleReveal = async () => {
    if (!room) return;
    await updateRoom(room.roomId, { state: 'revealed' });
  };

  const handleReset = async () => {
    if (!room) return;
    await clearVotes(room.roomId);
    await updateRoom(room.roomId, { state: 'voting' });
  };

  if (room?.state !== 'revealed') {
    return (
      <div className="space-y-6 text-center">
        <div className="inline-flex items-center gap-4 rounded-2xl bg-[var(--surface)] px-8 py-4 shadow-md">
          <div className="text-base font-semibold text-[var(--text-muted)]">
            {voterVotes.length} / {voters.length} voted
          </div>
          <div className="h-3 w-32 overflow-hidden rounded-full bg-[var(--background)]">
            <div
              className="h-full bg-[var(--accent-primary)] transition-all duration-300"
              style={{
                width: `${voters.length > 0 ? (voterVotes.length / voters.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {isModerator && allVoted && (
          <button
            onClick={handleReveal}
            className="rounded-2xl bg-[var(--accent-primary)] px-10 py-4 text-lg font-bold text-[var(--background)] shadow-lg transition-all hover:scale-105 hover:opacity-90 active:scale-95"
          >
            🌮 Serve the Nachos
          </button>
        )}

        {isModerator && !allVoted && (
          <p className="text-base font-medium text-[var(--text-muted)]">
            Waiting for all voters...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-[var(--text)]">Results Revealed!</h2>
        {analytics.hasConsensus && (
          <p className="text-base font-bold text-[var(--accent-secondary)]">
            🎉 Consensus reached!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-[var(--surface)] p-6 text-center shadow-lg">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Median
          </p>
          <p className="font-mono text-4xl font-bold text-[var(--accent-primary)]">
            {analytics.median ?? '-'}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface)] p-6 text-center shadow-lg">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Mode
          </p>
          <p className="font-mono text-4xl font-bold text-[var(--accent-primary)]">
            {analytics.mode ?? '-'}
          </p>
        </div>

        <div className="rounded-xl bg-[var(--surface)] p-6 text-center shadow-lg">
          <p className="mb-3 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            Total Votes
          </p>
          <p className="font-mono text-4xl font-bold text-[var(--accent-primary)]">
            {analytics.totalVotes}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--surface)] p-6 shadow-lg">
        <h3 className="mb-6 text-xl font-bold text-[var(--text)]">Vote Distribution</h3>
        <div className="space-y-4">
          {Object.entries(analytics.distribution)
            .sort(([a], [b]) => {
              const numA = a === '?' || a === '☕' ? Infinity : Number(a);
              const numB = b === '?' || b === '☕' ? Infinity : Number(b);
              return numA - numB;
            })
            .map(([value, count]) => {
              const percentage = ((count / analytics.totalVotes) * 100).toFixed(1);
              return (
                <div key={value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold text-[var(--text)]">{value}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[var(--text-muted)]">
                        {count} vote{count !== 1 ? 's' : ''}
                      </span>
                      <span className="min-w-[3rem] text-right font-mono text-base font-bold text-[var(--accent-primary)]">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-8 overflow-hidden rounded-xl bg-[var(--background)]">
                    <div
                      className="flex h-full items-center justify-start bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] px-3 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    >
                      {count > 0 && (
                        <span className="text-sm font-bold text-[var(--background)]">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {isModerator && (
        <div className="pt-2 text-center">
          <button
            onClick={handleReset}
            className="rounded-2xl bg-[var(--surface)] px-10 py-4 text-lg font-bold text-[var(--text)] shadow-lg transition-all hover:scale-105 hover:bg-[var(--accent-secondary)] hover:text-[var(--background)] active:scale-95"
          >
            Clear the Tray
          </button>
        </div>
      )}
    </div>
  );
}
