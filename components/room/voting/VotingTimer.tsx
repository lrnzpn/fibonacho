'use client';

import { useState, useEffect, useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom } from '@/lib/firebase/firestore';
import { Timestamp, deleteField } from 'firebase/firestore';
import { Clock, Play, Pause, Square, RotateCcw, Eye, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '@/config';

const MAX_TIMER_SECONDS = APP_CONFIG.timer.maxSeconds;

export default function VotingTimer() {
  const context = useContext(RoomContext);
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [pendingSeconds, setPendingSeconds] = useState<number>(0);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [pausedTime, setPausedTime] = useState<number | null>(null);

  useEffect(() => {
    if (!context || !user || !context.room) return;

    const room = context.room;
    const currentParticipant = context.participants.find((p) => p.uid === user.uid);
    const isModerator = currentParticipant?.role === 'moderator';

    if (!room.timerEndsAt) {
      return;
    }

    const handleTimerEnd = async () => {
      await updateRoom(room.roomId, {
        timerEndsAt: deleteField(),
        timerDuration: deleteField(),
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

    return () => {
      clearInterval(interval);
      setTimeLeft(null);
    };
  }, [context, user]);

  if (!context || !user || !context.room) return null;

  const { room, participants, votes } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';
  const isRoomOwner = room.moderatorId === user.uid;
  const canControlTimer = isModerator || isRoomOwner;
  const hasVotes = votes.length > 0;

  const startTimer = async () => {
    if (pendingSeconds <= 0 || pendingSeconds > MAX_TIMER_SECONDS) {
      return;
    }
    const endsAt = Timestamp.fromMillis(Date.now() + pendingSeconds * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
      timerDuration: pendingSeconds,
    });
    setPendingSeconds(0);
    setPausedTime(null);
  };

  const addTime = (additionalSeconds: number) => {
    const newTotal = pendingSeconds + additionalSeconds;
    if (newTotal > MAX_TIMER_SECONDS) {
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 3000);
      return;
    }
    setPendingSeconds(newTotal);
  };

  const addTimeToActive = async (additionalSeconds: number) => {
    if (!room.timerEndsAt || !room.timerDuration) return;
    const newDuration = room.timerDuration + additionalSeconds;
    if (newDuration > MAX_TIMER_SECONDS) {
      setShowMaxWarning(true);
      setTimeout(() => setShowMaxWarning(false), 3000);
      return;
    }
    const endsAt = Timestamp.fromMillis(
      Date.now() + (timeLeft || 0) * 1000 + additionalSeconds * 1000
    );
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
      timerDuration: newDuration,
    });
  };

  const pauseTimer = async () => {
    if (!room.timerEndsAt || timeLeft === null) return;
    setPausedTime(timeLeft);
    await updateRoom(room.roomId, {
      timerEndsAt: deleteField(),
      timerDuration: timeLeft,
    });
  };

  const resumeTimer = async () => {
    if (pausedTime === null) return;
    const endsAt = Timestamp.fromMillis(Date.now() + pausedTime * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
      timerDuration: pausedTime,
    });
    setPausedTime(null);
  };

  const stopTimer = async () => {
    setPausedTime(null);
    await updateRoom(room.roomId, {
      timerEndsAt: deleteField(),
      timerDuration: deleteField(),
    });
  };

  const resetTimer = async () => {
    if (!room.timerDuration) return;
    const endsAt = Timestamp.fromMillis(Date.now() + room.timerDuration * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
    });
  };

  const toggleReveal = async () => {
    const newState = room.state === 'revealed' ? 'voting' : 'revealed';
    await updateRoom(room.roomId, {
      state: newState,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPaused = pausedTime !== null;
  const isActive = (timeLeft !== null && timeLeft > 0) || isPaused;
  const isExpired = timeLeft === 0 && !isPaused;
  const hasPendingTime = pendingSeconds > 0 && !isActive && !isExpired;

  return (
    <div className="flex h-full flex-col rounded-xl bg-[var(--surface)] p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-[var(--text-muted)]" />
          <div>
            <h3 className="mb-1 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
              Timer
            </h3>
            {isActive || isExpired ? (
              <p
                className={`font-mono text-lg font-bold ${
                  isExpired
                    ? 'text-red-500'
                    : isPaused
                      ? 'text-yellow-600'
                      : 'text-[var(--accent-primary)]'
                }`}
              >
                {formatTime(isPaused ? pausedTime! : timeLeft!)}
                {isPaused && <span className="ml-2 text-xs">(Paused)</span>}
              </p>
            ) : (
              <p className="text-base text-[var(--text-muted)]">Not started</p>
            )}
          </div>
        </div>

        {canControlTimer && (
          <div className="flex flex-col gap-2">
            {showMaxWarning && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span>Max timer is {MAX_TIMER_SECONDS}s</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {!isActive && !isExpired && (
                <>
                  <button
                    onClick={() => addTime(30)}
                    className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-semibold text-[var(--background)] transition-all hover:scale-110"
                    title="Add 30 seconds"
                  >
                    +30s
                  </button>
                  {hasPendingTime && (
                    <>
                      <div className="flex items-center rounded-lg bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
                        {pendingSeconds}s
                      </div>
                      <button
                        onClick={startTimer}
                        className="rounded-lg bg-green-500 p-2 text-white transition-all hover:scale-110"
                        title="Start timer"
                      >
                        <Play className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setPendingSeconds(0)}
                        className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110"
                        title="Clear"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </>
              )}

              {isActive && !isExpired && (
                <>
                  {!isPaused && (
                    <button
                      onClick={() => addTimeToActive(30)}
                      className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-sm font-semibold text-[var(--background)] transition-all hover:scale-110"
                      title="Add 30 seconds"
                    >
                      +30s
                    </button>
                  )}
                  {isPaused ? (
                    <button
                      onClick={resumeTimer}
                      className="rounded-lg bg-green-500 p-2 text-white transition-all hover:scale-110"
                      title="Resume timer"
                    >
                      <Play className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={pauseTimer}
                      className="rounded-lg bg-yellow-500 p-2 text-white transition-all hover:scale-110"
                      title="Pause timer"
                    >
                      <Pause className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={stopTimer}
                    className="rounded-lg bg-red-500 p-2 text-white transition-all hover:scale-110"
                    title="Stop timer"
                  >
                    <Square className="h-5 w-5" />
                  </button>
                  {!isPaused && (
                    <button
                      onClick={resetTimer}
                      className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
                      title="Reset timer"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  )}
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
          </div>
        )}
      </div>

      {canControlTimer && (
        <div className="mt-4 border-t border-[var(--background)] pt-4">
          <button
            onClick={toggleReveal}
            disabled={!hasVotes && room.state !== 'revealed'}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              !hasVotes && room.state !== 'revealed'
                ? 'cursor-not-allowed bg-[var(--surface)] text-[var(--text-muted)] opacity-50'
                : room.state === 'revealed'
                  ? 'hover:bg-opacity-80 bg-[var(--background)] text-[var(--text)] hover:scale-102'
                  : 'bg-[var(--accent-secondary)] text-[var(--background)] hover:scale-102'
            }`}
            title={!hasVotes && room.state !== 'revealed' ? 'No votes to reveal yet' : ''}
          >
            <Eye className="h-4 w-4" />
            {room.state === 'revealed' ? 'Hide Votes' : 'Reveal Votes'}
          </button>
        </div>
      )}
    </div>
  );
}
