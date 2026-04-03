'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createRoom, addParticipant, getRoom, getParticipantCount } from '@/lib/firebase/firestore';
import { ParticipantRole } from '@/types';
import { setSessionStorage } from '@/lib/utils/room';
import { sanitizeDisplayName } from '@/lib/utils/sanitize';
import { LIMITS } from '@/lib/constants';

interface JoinRoomModalProps {
  roomId: string;
  onJoin: () => void;
}

export default function JoinRoomModal({ roomId, onJoin }: JoinRoomModalProps) {
  const { user, signIn } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<ParticipantRole>('voter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeDisplayName(displayName, LIMITS.MAX_DISPLAY_NAME_LENGTH);

    if (!sanitized) {
      setError('Please enter your name');
      return;
    }

    if (sanitized.length > LIMITS.MAX_DISPLAY_NAME_LENGTH) {
      setError(`Name must be ${LIMITS.MAX_DISPLAY_NAME_LENGTH} characters or less`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      let currentUser = user;

      if (!currentUser) {
        currentUser = await signIn();
      }

      if (!currentUser) {
        setError('Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      const existingRoom = await getRoom(roomId);

      if (!existingRoom) {
        await createRoom(roomId, currentUser.uid);
        await addParticipant(roomId, currentUser.uid, {
          displayName: sanitized,
          role: 'moderator',
        });
      } else {
        const participantCount = await getParticipantCount(roomId);
        if (participantCount >= LIMITS.MAX_PARTICIPANTS_PER_ROOM) {
          setError(`Room is full (max ${LIMITS.MAX_PARTICIPANTS_PER_ROOM} participants)`);
          setLoading(false);
          return;
        }

        await addParticipant(roomId, currentUser.uid, {
          displayName: sanitized,
          role,
        });
      }

      setSessionStorage('displayName', sanitized);
      setSessionStorage('roomId', roomId);
      onJoin();
    } catch (err) {
      console.error('Failed to join room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-[var(--surface)] p-10 shadow-2xl">
        <div className="space-y-3 text-center">
          <h2 className="text-4xl font-bold text-[var(--text)]">Join Room</h2>
          <p className="font-mono text-xl tracking-wider text-[var(--text-muted)]">{roomId}</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-3">
            <label
              htmlFor="displayName"
              className="block text-sm font-semibold tracking-wide text-[var(--text)] uppercase"
            >
              Your Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) =>
                setDisplayName(sanitizeDisplayName(e.target.value, LIMITS.MAX_DISPLAY_NAME_LENGTH))
              }
              placeholder="Enter your name"
              className="w-full rounded-2xl border-2 border-transparent bg-[var(--background)] px-5 py-4 text-lg text-[var(--text)] transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
              maxLength={LIMITS.MAX_DISPLAY_NAME_LENGTH}
              autoComplete="off"
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold tracking-wide text-[var(--text)] uppercase">
              Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('voter')}
                className={`rounded-2xl px-5 py-4 font-semibold transition-all ${
                  role === 'voter'
                    ? 'scale-105 bg-[var(--accent-primary)] text-[var(--background)] shadow-lg'
                    : 'hover:bg-opacity-20 bg-[var(--background)] text-[var(--text)] hover:scale-105 hover:bg-[var(--accent-primary)]'
                }`}
              >
                Voter
              </button>
              <button
                type="button"
                onClick={() => setRole('spectator')}
                className={`rounded-2xl px-5 py-4 font-semibold transition-all ${
                  role === 'spectator'
                    ? 'scale-105 bg-[var(--accent-primary)] text-[var(--background)] shadow-lg'
                    : 'hover:bg-opacity-20 bg-[var(--background)] text-[var(--text)] hover:scale-105 hover:bg-[var(--accent-primary)]'
                }`}
              >
                Spectator
              </button>
            </div>
            <p className="pt-1 text-sm leading-relaxed text-[var(--text-muted)]">
              {role === 'voter' ? 'Can vote and see results' : 'View-only, cannot vote'}
            </p>
          </div>

          {error && (
            <div className="bg-opacity-10 rounded-2xl border-2 border-red-500 bg-red-500 p-4">
              <p className="text-sm font-medium text-red-500">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            className="mt-2 w-full rounded-2xl bg-[var(--accent-primary)] px-8 py-5 text-lg font-semibold text-[var(--background)] transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
}
