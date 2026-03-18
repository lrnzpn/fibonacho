'use client';

import { useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { Eye } from 'lucide-react';

export default function ParticipantsList() {
  const context = useContext(RoomContext);

  if (!context) {
    return null;
  }

  const { participants, votes } = context;

  const getParticipantVoteStatus = (participantId: string) => {
    return votes.some((vote) => vote.userId === participantId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--text)]">Participants ({participants.length})</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {participants.map((participant) => {
          const hasVoted = getParticipantVoteStatus(participant.uid);

          return (
            <div
              key={participant.uid}
              className={`rounded-xl border-2 p-4 transition-all ${
                hasVoted
                  ? 'bg-opacity-10 border-[var(--accent-secondary)] bg-[var(--accent-secondary)] shadow-lg'
                  : 'hover:border-opacity-30 border-[var(--surface)] bg-[var(--surface)] hover:border-[var(--accent-primary)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent-primary)] text-base font-bold text-[var(--background)]">
                  {participant.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text)]">
                    {participant.displayName}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {participant.role === 'spectator' && (
                      <Eye className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    )}
                    {participant.role === 'moderator' && (
                      <span className="text-xs font-semibold tracking-wide text-[var(--accent-primary)] uppercase">
                        Moderator
                      </span>
                    )}
                    {participant.role === 'voter' && (
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        {hasVoted ? '✓ Voted' : 'Waiting...'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <div className="rounded-2xl bg-[var(--surface)] px-6 py-16 text-center">
          <p className="text-lg leading-relaxed text-[var(--text-muted)]">
            No participants yet. Share the room code to invite others!
          </p>
        </div>
      )}
    </div>
  );
}
