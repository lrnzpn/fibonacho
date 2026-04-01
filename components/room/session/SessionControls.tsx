'use client';

import { useState, useEffect, useContext } from 'react';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';
import { updateRoom, getHistory } from '@/lib/firebase/firestore';
import { Timestamp, deleteField } from 'firebase/firestore';
import { Clock, Play, Pause, RotateCcw, History, Download, Copy, Check } from 'lucide-react';
import { HistoryEntry } from '@/types';
import { APP_CONFIG } from '@/config';

const MAX_TIMER_SECONDS = APP_CONFIG.timer.maxSeconds;

interface SessionControlsProps {
  roomId: string;
}

export default function SessionControls({ roomId }: SessionControlsProps) {
  const context = useContext(RoomContext);
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [customSeconds, setCustomSeconds] = useState<string>('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!context || !user || !context.room) return;

    const { room } = context;
    const currentParticipant = context.participants.find((p) => p.uid === user.uid);
    const isModerator = currentParticipant?.role === 'moderator';

    if (!room.timerEndsAt) {
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

    return () => {
      clearInterval(interval);
      setTimeLeft(null);
    };
  }, [context, user]);

  useEffect(() => {
    const loadHistory = async () => {
      const entries = await getHistory(roomId);
      setHistory(entries);
    };

    if (isHistoryOpen) {
      loadHistory();
    }
  }, [roomId, isHistoryOpen]);

  if (!context || !user || !context.room) return null;

  const { room, participants } = context;
  const currentParticipant = participants.find((p) => p.uid === user.uid);
  const isModerator = currentParticipant?.role === 'moderator';
  const isRoomOwner = room.moderatorId === user.uid;
  const canControlTimer = isModerator || isRoomOwner;

  const startTimer = async () => {
    const seconds = parseInt(customSeconds);
    if (isNaN(seconds) || seconds <= 0 || seconds > MAX_TIMER_SECONDS) {
      return;
    }
    const endsAt = Timestamp.fromMillis(Date.now() + seconds * 1000);
    await updateRoom(room.roomId, {
      timerEndsAt: endsAt,
      timerDuration: seconds,
    });
    setShowInput(false);
    setCustomSeconds('');
  };

  const stopTimer = async () => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHistoryAsText = () => {
    if (history.length === 0) return 'No estimation history yet.';

    let text = '=== Planning Poker Session History ===\n\n';

    history.forEach((entry, index) => {
      text += `${index + 1}. ${entry.topic}\n`;
      text += `   Story Points: ${entry.finalEstimate ?? entry.median ?? entry.mode ?? 'N/A'}\n`;
      text += `   Completed: ${entry.completedAt.toDate().toLocaleString()}\n\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    const text = formatHistoryAsText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatHistoryAsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-poker-history-${roomId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isActive = timeLeft !== null && timeLeft > 0;
  const isExpired = timeLeft === 0;

  return (
    <div className="rounded-xl bg-[var(--surface)] p-4 shadow-lg">
      <div className="flex flex-col gap-4">
        {/* History Section */}
        <div className="border-b border-[var(--background)] pb-4">
          {!isHistoryOpen ? (
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:bg-opacity-80 flex w-full items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition-all"
              title="View session history"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">
                {history.length > 0 ? `${history.length} rounds` : 'View'}
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
                  <History className="h-4 w-4" />
                  Session History
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-[var(--background)] p-1.5 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="rounded-lg bg-[var(--background)] p-1.5 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
                    title="Download as text file"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="rounded-lg bg-[var(--background)] p-1.5 text-[var(--text-muted)] transition-all hover:scale-110"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="py-4 text-center text-xs text-[var(--text-muted)]">
                  No estimation history yet.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {history.map((entry) => (
                    <div
                      key={entry.entryId}
                      className="rounded-lg bg-[var(--background)] p-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-1.5">
                            <span className="rounded-full bg-[var(--accent-primary)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--background)]">
                              #{entry.roundNumber}
                            </span>
                            <h5 className="truncate font-semibold text-[var(--text)]">
                              {entry.topic}
                            </h5>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[var(--text-muted)]">Points:</span>
                            <span className="font-mono font-bold text-[var(--accent-primary)]">
                              {entry.finalEstimate ?? entry.median ?? entry.mode ?? 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timer Section */}
        <div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--text-muted)]" />
              <h4 className="text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                Timer
              </h4>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div>
                {isActive || isExpired ? (
                  <p
                    className={`font-mono text-2xl font-bold ${
                      isExpired ? 'text-red-500' : 'text-[var(--accent-primary)]'
                    }`}
                  >
                    {formatTime(timeLeft!)}
                  </p>
                ) : (
                  <p className="text-lg text-[var(--text-muted)]">Not started</p>
                )}
              </div>

              {canControlTimer && (
                <div className="flex flex-wrap gap-2">
                  {!isActive && !isExpired && (
                    <>
                      {showInput ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={customSeconds}
                            onChange={(e) => setCustomSeconds(e.target.value)}
                            placeholder="Sec"
                            min="1"
                            max={MAX_TIMER_SECONDS}
                            className="w-16 [appearance:textfield] rounded-lg border-2 border-[var(--accent-primary)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--text)] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            autoComplete="off"
                            autoFocus
                          />
                          <button
                            onClick={startTimer}
                            disabled={
                              !customSeconds ||
                              parseInt(customSeconds) <= 0 ||
                              parseInt(customSeconds) > MAX_TIMER_SECONDS
                            }
                            className="rounded-lg bg-[var(--accent-primary)] p-2 text-[var(--background)] transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                            title="Start timer"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowInput(false);
                              setCustomSeconds('');
                            }}
                            className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-105"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowInput(true)}
                          className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 text-xs font-semibold text-[var(--background)] transition-all hover:scale-105"
                          title="Set timer"
                        >
                          Set Timer
                        </button>
                      )}
                    </>
                  )}

                  {isActive && (
                    <>
                      <button
                        onClick={stopTimer}
                        className="rounded-lg bg-red-500 p-2 text-white transition-all hover:scale-105"
                        title="Stop timer"
                      >
                        <Pause className="h-4 w-4" />
                      </button>
                      <button
                        onClick={resetTimer}
                        className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-105 hover:text-[var(--accent-primary)]"
                        title="Reset timer"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    </>
                  )}

                  {isExpired && (
                    <button
                      onClick={stopTimer}
                      className="rounded-lg bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)]"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
