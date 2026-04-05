'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  createRoom,
  addParticipant,
  getRoom,
  getParticipantCount,
  getParticipant,
} from '@/lib/firebase/firestore';
import { ParticipantRole } from '@/types';
import { setSessionStorage } from '@/lib/utils/room';
import { sanitizeDisplayName } from '@/lib/utils/sanitize';
import { ArrowLeft } from 'lucide-react';
import { LIMITS } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils/cn';

interface JoinRoomModalProps {
  roomId: string;
  onJoin: () => void;
}

export default function JoinRoomModal({ roomId, onJoin }: JoinRoomModalProps) {
  const router = useRouter();
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

      // Check if user is already a participant (handles refresh case)
      const existingParticipant = await getParticipant(roomId, currentUser.uid);
      if (existingParticipant) {
        setSessionStorage('displayName', existingParticipant.displayName);
        setSessionStorage('roomId', roomId);
        onJoin();
        return;
      }

      let existingRoom = await getRoom(roomId);

      if (!existingRoom) {
        // Create room only if it doesn't exist
        // Use the first user who navigates here as moderator
        try {
          await createRoom(roomId, currentUser.uid);
          await addParticipant(roomId, currentUser.uid, {
            displayName: sanitized,
            role: 'moderator',
          });
        } catch (createError) {
          // If room creation fails (e.g., another user just created it), try to join instead
          console.error('Room creation failed, attempting to join existing room');

          // Wait a bit and retry checking for the room
          await new Promise((resolve) => setTimeout(resolve, 500));
          existingRoom = await getRoom(roomId);

          if (existingRoom) {
            await addParticipant(roomId, currentUser.uid, {
              displayName: sanitized,
              role,
            });
          } else {
            throw createError;
          }
        }
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
      <div className="w-full max-w-md space-y-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-[var(--text-muted)] transition-all hover:text-[var(--accent-primary)]"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
        <Card padding="lg" className="space-y-6 rounded-3xl">
          <div className="space-y-2 text-center">
            <h2 className="text-4xl font-bold text-[var(--text)]">Join Room</h2>
            <p className="font-mono text-xl tracking-wider text-[var(--text-muted)]">{roomId}</p>
          </div>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-semibold tracking-wide text-[var(--text)] uppercase"
              >
                Your Name
              </label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                maxLength={LIMITS.MAX_DISPLAY_NAME_LENGTH}
                autoComplete="off"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <label
                id="role-label"
                className="block text-sm font-semibold tracking-wide text-[var(--text)] uppercase"
              >
                Role
              </label>
              <div className="grid grid-cols-2 gap-4" role="group" aria-labelledby="role-label">
                <button
                  type="button"
                  onClick={() => setRole('voter')}
                  aria-pressed={role === 'voter'}
                  className={cn(
                    'rounded-2xl px-5 py-4 font-semibold transition-all',
                    role === 'voter'
                      ? 'scale-105 bg-[var(--accent-primary)] text-[var(--background)] shadow-lg'
                      : 'hover:bg-opacity-20 bg-[var(--background)] text-[var(--text)] hover:scale-105 hover:bg-[var(--accent-primary)]'
                  )}
                >
                  Voter
                </button>
                <button
                  type="button"
                  onClick={() => setRole('spectator')}
                  aria-pressed={role === 'spectator'}
                  className={cn(
                    'rounded-2xl px-5 py-4 font-semibold transition-all',
                    role === 'spectator'
                      ? 'scale-105 bg-[var(--accent-primary)] text-[var(--background)] shadow-lg'
                      : 'hover:bg-opacity-20 bg-[var(--background)] text-[var(--text)] hover:scale-105 hover:bg-[var(--accent-primary)]'
                  )}
                >
                  Spectator
                </button>
              </div>
              <p
                id="role-description"
                className="pt-1 text-sm leading-relaxed text-[var(--text-muted)]"
              >
                {role === 'voter' ? 'Can vote and see results' : 'View-only, cannot vote'}
              </p>
            </div>

            {error && (
              <div className="bg-opacity-10 rounded-2xl border-2 border-red-500 bg-red-500 p-4">
                <p className="text-sm font-medium text-red-500">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !displayName.trim()}
              variant="primary"
              size="md"
              fullWidth
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
