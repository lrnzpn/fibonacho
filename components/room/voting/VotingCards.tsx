'use client';

import { useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { submitVote, updateVote } from '@/lib/firebase/firestore';
import { VoteValue, FibonacciValue, SpecialCard } from '@/types';
import { nanoid } from 'nanoid';

const FIBONACCI_VALUES: FibonacciValue[] = [0, 1, 2, 3, 5, 8, 13];
const SPECIAL_CARDS: SpecialCard[] = ['?', '☕'];

export default function VotingCards() {
  const context = useContext(RoomContext);
  const { user } = useAuth();

  if (!context || !user) {
    return null;
  }

  const { room, participants, votes } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const currentVote = votes.find((v) => v.userId === user.uid);

  if (!currentParticipant) {
    return null;
  }

  if (currentParticipant.role === 'spectator') {
    return (
      <div className="rounded-2xl bg-[var(--surface)] px-6 py-16 text-center" role="status">
        <p className="text-lg text-[var(--text-muted)]">You are spectating this session.</p>
      </div>
    );
  }

  if (room?.state === 'revealed') {
    return (
      <div
        className="rounded-2xl bg-[var(--surface)] px-6 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg leading-relaxed text-[var(--text-muted)]">
          Votes have been revealed! Waiting for next round...
        </p>
      </div>
    );
  }

  const handleVote = async (value: VoteValue) => {
    if (!room) return;

    try {
      if (currentVote) {
        await updateVote(room.roomId, currentVote.voteId, value);
      } else {
        const voteId = nanoid();
        await submitVote(room.roomId, voteId, user.uid, `round-${room.currentRound}`, value);
      }
    } catch (error) {
      console.error('Failed to submit vote:', error);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2
        className="text-center text-lg font-bold text-[var(--text)] md:text-xl"
        id="voting-cards-heading"
      >
        Select Your Estimate
      </h2>

      <div
        className="flex flex-wrap justify-center gap-2 md:gap-3"
        role="group"
        aria-labelledby="voting-cards-heading"
      >
        {FIBONACCI_VALUES.map((value) => (
          <button
            key={value}
            onClick={() => handleVote(value)}
            className={`h-24 w-16 rounded-xl font-mono text-2xl font-bold transition-all focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none ${
              currentVote?.value === value
                ? 'ring-opacity-30 scale-110 bg-[var(--accent-primary)] text-[var(--background)] shadow-2xl ring-4 ring-[var(--accent-primary)]'
                : 'hover:bg-opacity-20 bg-[var(--surface)] text-[var(--text)] shadow-md hover:scale-105 hover:bg-[var(--accent-primary)]'
            }`}
            aria-label={`Vote ${value} story points`}
            aria-pressed={currentVote?.value === value}
          >
            {value}
          </button>
        ))}

        {SPECIAL_CARDS.map((value) => {
          const label = value === '?' ? 'Unknown or need more information' : 'Coffee break needed';
          return (
            <button
              key={value}
              onClick={() => handleVote(value)}
              className={`h-24 w-16 rounded-xl text-3xl font-bold transition-all focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none ${
                currentVote?.value === value
                  ? 'ring-opacity-30 scale-110 bg-[var(--accent-primary)] text-[var(--background)] shadow-2xl ring-4 ring-[var(--accent-primary)]'
                  : 'hover:bg-opacity-20 bg-[var(--surface)] text-[var(--text)] shadow-md hover:scale-105 hover:bg-[var(--accent-primary)]'
              }`}
              aria-label={`Vote ${label}`}
              aria-pressed={currentVote?.value === value}
            >
              {value}
            </button>
          );
        })}
      </div>

      {currentVote && (
        <div className="pt-2 text-center" role="status" aria-live="polite">
          <p className="text-base font-semibold text-[var(--accent-secondary)]">
            <span aria-hidden="true">✓</span> Your vote:{' '}
            <span className="font-mono text-lg font-bold">{currentVote.value}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
            You can change your vote anytime before reveal
          </p>
        </div>
      )}
    </div>
  );
}
