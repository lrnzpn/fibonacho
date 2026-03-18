'use client';

import { useState, useEffect, useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';

const TIMER_PRESETS = [60, 120, 300, 600]; // 1min, 2min, 5min, 10min

export default function VotingTimer() {
  const context = useContext(RoomContext);
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (!context || !user || !context.room) return;

    const { room } = context;
    const currentParticipant = context.participants.find((p) => p.uid === user.uid);
    const isModerator = currentParticipant?.role === 'moderator';

    if (!room.timerEndsAt) {
      setTimeLeft(null);
      return;
    }

    const handleTimerEnd = async () => {
      await updateRoom(room.roomId, {
        timerEndsAt: undefined,
        timerDuration: undefined,
      });
    };

    const updateTimer = () => {
      const now = Date.now();
      const endsAt = room.timerEndsAt!.toMillis();
      const remaining = Math.max(0, Math.floor((endsAt - now) / 1000));

      setTimeLeft(remaining);

      if (remaining === 0 && isModerator) {
        handleTimerEnd();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [context, user]);

  if (!context || !user || !context.room) return null;

  const { room, participants } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';

  const startTimer = async (seconds: number) => {
    const endsAt = Timestamp.fromMillis(Date.now() + seconds * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
      timerDuration: seconds,
    });
    setShowPresets(false);
  };

  const stopTimer = async () => {
    await updateRoom(room.roomId, {
      timerEndsAt: undefined,
      timerDuration: undefined,
    });
  };

  const resetTimer = async () => {
    if (!room.timerDuration) return;
    const endsAt = Timestamp.fromMillis(Date.now() + room.timerDuration * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isActive = timeLeft !== null && timeLeft > 0;
  const isExpired = timeLeft === 0;

  return (
    <div className="rounded-xl bg-[var(--surface)] p-5 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-[var(--text-muted)]" />
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
              Timer
            </h3>
            {isActive || isExpired ? (
              <p
                className={`font-mono text-xl font-bold ${
                  isExpired ? 'text-red-500' : 'text-[var(--accent-primary)]'
                }`}
              >
                {formatTime(timeLeft!)}
              </p>
            ) : (
              <p className="text-base text-[var(--text-muted)]">Not started</p>
            )}
          </div>
        </div>

        {isModerator && (
          <div className="flex gap-2">
            {!isActive && !isExpired && (
              <div className="relative">
                <button
                  onClick={() => setShowPresets(!showPresets)}
                  className="rounded-lg bg-[var(--accent-primary)] p-2 text-[var(--background)] transition-all hover:scale-110"
                  title="Start timer"
                >
                  <Play className="h-5 w-5" />
                </button>

                {showPresets && (
                  <div className="absolute top-12 right-0 z-10 flex flex-col gap-2 rounded-xl bg-[var(--background)] p-3 shadow-2xl">
                    {TIMER_PRESETS.map((seconds) => (
                      <button
                        key={seconds}
                        onClick={() => startTimer(seconds)}
                        className="rounded-lg bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)]"
                      >
                        {formatTime(seconds)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isActive && (
              <>
                <button
                  onClick={stopTimer}
                  className="rounded-lg bg-red-500 p-2 text-white transition-all hover:scale-110"
                  title="Stop timer"
                >
                  <Pause className="h-5 w-5" />
                </button>
                <button
                  onClick={resetTimer}
                  className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
                  title="Reset timer"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
              </>
            )}

            {isExpired && (
              <button
                onClick={stopTimer}
                className="rounded-lg bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)]"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
