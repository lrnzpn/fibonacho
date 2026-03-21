'use client';

import { useState, useEffect } from 'react';
import { History, Download, Copy, Check } from 'lucide-react';
import { getHistory } from '@/lib/firebase/firestore';
import { HistoryEntry } from '@/types';

interface SessionHistoryProps {
  roomId: string;
}

export default function SessionHistory({ roomId }: SessionHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      const entries = await getHistory(roomId);
      setHistory(entries);
    };

    if (isOpen) {
      loadHistory();
    }
  }, [roomId, isOpen]);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-2 text-sm font-semibold whitespace-nowrap text-[var(--text)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)]"
        title="View session history"
      >
        <History className="h-4 w-4" />
        <span>History</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-[var(--surface)] p-4 shadow-lg md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--text)] md:text-xl">
          <History className="h-5 w-5" />
          Session History
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110 hover:text-[var(--accent-primary)]"
            title="Download as text file"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg bg-[var(--background)] p-2 text-[var(--text-muted)] transition-all hover:scale-110"
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <p className="py-8 text-center text-[var(--text-muted)]">
          No estimation history yet. Complete a round to see it here!
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.entryId}
              className="hover:ring-opacity-30 rounded-lg bg-[var(--background)] p-4 transition-all hover:ring-2 hover:ring-[var(--accent-primary)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full bg-[var(--accent-primary)] px-2 py-0.5 text-xs font-bold text-[var(--background)]">
                      #{entry.roundNumber}
                    </span>
                    <h4 className="font-semibold text-[var(--text)]">{entry.topic}</h4>
                  </div>
                  <div className="text-sm">
                    <span className="text-[var(--text-muted)]">Story Points: </span>
                    <span className="font-mono text-lg font-bold text-[var(--accent-primary)]">
                      {entry.finalEstimate ?? entry.median ?? entry.mode ?? 'N/A'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    {entry.completedAt.toDate().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
