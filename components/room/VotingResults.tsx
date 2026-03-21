'use client';

import { useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom, clearVotes, saveHistoryEntry } from '@/lib/firebase/firestore';
import { calculateVoteAnalytics } from '@/lib/utils/analytics';
import VoteChart from './VoteChart';
import { nanoid } from 'nanoid';
import type { VoteValue } from '@/types';

export default function VotingResults() {
  const context = useContext(RoomContext);
  const { user } = useAuth();

  if (!context || !user) {
    return null;
  }

  const { room, participants, votes } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';

  const voters = participants.filter((p) => p.role === 'voter');
  const voterVotes = votes.filter((v) => voters.some((voter) => voter.uid === v.userId));
  const allVoted = voters.length > 0 && voterVotes.length === voters.length;
  const analytics = calculateVoteAnalytics(votes);

  // Show vote count when there are 2+ participants (moderator + at least 1 voter)
  const showVoteCount = participants.length >= 2;

  const handleReveal = async () => {
    if (!room) return;
    await updateRoom(room.roomId, { state: 'revealed' });
  };

  const handleReset = async () => {
    if (!room) return;

    // Save history entry before clearing
    const entryId = nanoid();
    await saveHistoryEntry(
      room.roomId,
      entryId,
      room.currentTopic || 'Untitled Topic',
      analytics.mode as VoteValue | null, // Use mode as final estimate
      analytics.median,
      analytics.mode,
      analytics.totalVotes,
      room.currentRound
    );

    await clearVotes(room.roomId);
    await updateRoom(room.roomId, {
      state: 'voting',
      currentRound: room.currentRound + 1,
    });
  };

  if (room?.state !== 'revealed') {
    return (
      <div className="space-y-4 text-center md:space-y-6">
        {showVoteCount && (
          <div className="inline-flex items-center gap-3 rounded-2xl bg-[var(--surface)] px-6 py-3 shadow-md md:gap-4 md:px-8 md:py-4">
            <div className="text-sm font-semibold text-[var(--text-muted)] md:text-base">
              {voterVotes.length} / {voters.length} voted
            </div>
            <div className="h-3 w-24 overflow-hidden rounded-full bg-[var(--background)] md:w-32">
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-300"
                style={{
                  width: `${voters.length > 0 ? (voterVotes.length / voters.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {isModerator && allVoted && (
          <button
            onClick={handleReveal}
            className="rounded-2xl bg-[var(--accent-primary)] px-8 py-3 text-base font-bold text-[var(--background)] shadow-lg transition-all hover:scale-105 hover:opacity-90 active:scale-95 md:px-10 md:py-4 md:text-lg"
          >
            🌮 Serve the Nachos
          </button>
        )}

        {isModerator && !allVoted && (
          <p className="text-sm font-medium text-[var(--text-muted)] md:text-base">
            Waiting for all voters...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold text-[var(--text)] md:text-2xl">Results Revealed!</h2>
        {analytics.hasConsensus && (
          <p className="text-sm font-bold text-[var(--accent-secondary)] md:text-base">
            🎉 Consensus reached!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
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

      <VoteChart distribution={analytics.distribution} totalVotes={analytics.totalVotes} />

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
