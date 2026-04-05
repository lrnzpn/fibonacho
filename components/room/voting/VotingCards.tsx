'use client';

import { useContext, useState } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { submitVote, updateVote, addReaction } from '@/lib/firebase/firestore';
import { VoteValue, ReactionType } from '@/types';
import { nanoid } from 'nanoid';
import { Smile } from 'lucide-react';
import { APP_CONFIG } from '@/config';
import { cn } from '@/lib/utils/cn';

const FIBONACCI_VALUES = APP_CONFIG.voting.fibonacciValues;
const SPECIAL_CARDS = APP_CONFIG.voting.specialCards;
const REACTIONS = APP_CONFIG.reactions.availableReactions;

export default function VotingCards() {
  const context = useContext(RoomContext);
  const { user } = useAuth();
  const [isReactionsOpen, setIsReactionsOpen] = useState(false);

  if (!context || !user) {
    return null;
  }

  const { room, participants, votes } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const currentVote = votes.find((v) => v.userId === user.uid);

  if (!currentParticipant) {
    return null;
  }

  // Only spectators cannot vote - both voters and moderators can vote
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

  const handleReaction = async (type: ReactionType) => {
    if (!room) return;
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 60 + 20;
    await addReaction(room.roomId, user.uid, type, x, y);
    setIsReactionsOpen(false);
  };

  return (
    <div className="w-full max-w-5xl px-4 pb-4 md:fixed md:bottom-0 md:left-1/2 md:z-40 md:-translate-x-1/2 md:pb-4">
      <div className="rounded-2xl border border-[var(--surface)]/50 bg-[var(--background)]/80 p-4 shadow-2xl backdrop-blur-md md:p-6">
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <h2
              className="text-base font-bold text-[var(--text)] md:text-lg"
              id="voting-cards-heading"
            >
              Select Your Estimate
            </h2>

            {/* Reactions Button */}
            <div className="relative">
              {isReactionsOpen && (
                <div className="absolute right-0 bottom-full mb-2 flex items-center gap-2 rounded-xl bg-[var(--surface)]/90 p-2 shadow-xl backdrop-blur-sm">
                  {REACTIONS.map((reaction) => (
                    <button
                      key={reaction}
                      onClick={() => handleReaction(reaction)}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all hover:scale-125 hover:bg-[var(--background)]"
                      title={`Send ${reaction}`}
                    >
                      {reaction}
                    </button>
                  ))}
                </div>
              )}
              <button
                onClick={() => setIsReactionsOpen(!isReactionsOpen)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg shadow-lg transition-all hover:scale-105',
                  isReactionsOpen
                    ? 'bg-[var(--accent-secondary)] text-[var(--background)]'
                    : 'bg-[var(--accent-primary)] text-[var(--background)]'
                )}
                title="Send reaction"
              >
                <Smile className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="flex flex-wrap justify-center gap-2 md:gap-3"
            role="group"
            aria-labelledby="voting-cards-heading"
          >
            {FIBONACCI_VALUES.map((value) => {
              const isSelected = currentVote?.value === value;
              return (
                <button
                  key={value}
                  onClick={() => handleVote(value)}
                  className={cn(
                    'group relative h-20 w-14 rounded-xl font-mono text-xl font-bold transition-all duration-300',
                    'focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none',
                    'md:h-24 md:w-16 md:text-2xl',
                    isSelected
                      ? 'ring-opacity-30 scale-110 -rotate-6 animate-pulse bg-[var(--accent-primary)] text-[var(--background)] shadow-2xl ring-4 ring-[var(--accent-primary)]'
                      : 'bg-[var(--surface)] text-[var(--text)] shadow-md hover:-translate-y-2 hover:scale-110 hover:rotate-3 hover:bg-[var(--accent-primary)] hover:text-[var(--background)] active:scale-95'
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                  aria-label={`Vote ${value} story points`}
                  aria-pressed={isSelected}
                >
                  {value}
                </button>
              );
            })}

            {SPECIAL_CARDS.map((value) => {
              const label =
                value === '?' ? 'Unknown or need more information' : 'Coffee break needed';
              const isSelected = currentVote?.value === value;
              return (
                <button
                  key={value}
                  onClick={() => handleVote(value)}
                  className={cn(
                    'group relative h-20 w-14 rounded-xl text-2xl font-bold transition-all duration-300',
                    'focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none',
                    'md:h-24 md:w-16 md:text-3xl',
                    isSelected
                      ? 'ring-opacity-30 scale-110 -rotate-6 animate-pulse bg-[var(--accent-primary)] text-[var(--background)] shadow-2xl ring-4 ring-[var(--accent-primary)]'
                      : 'bg-[var(--surface)] text-[var(--text)] shadow-md hover:-translate-y-2 hover:scale-110 hover:rotate-3 hover:bg-[var(--accent-primary)] hover:text-[var(--background)] active:scale-95'
                  )}
                  style={{
                    transformStyle: 'preserve-3d',
                    perspective: '1000px',
                  }}
                  aria-label={`Vote ${label}`}
                  aria-pressed={isSelected}
                >
                  {value}
                </button>
              );
            })}
          </div>

          {currentVote && (
            <div className="text-center" role="status" aria-live="polite">
              <p className="text-sm font-semibold text-[var(--accent-secondary)]">
                <span aria-hidden="true">✓</span> Your vote:{' '}
                <span className="font-mono text-base font-bold">{currentVote.value}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
