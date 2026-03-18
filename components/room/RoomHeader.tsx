'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils/room';
import ThemeToggle from '@/components/ThemeToggle';

interface RoomHeaderProps {
  roomId: string;
}

export default function RoomHeader({ roomId }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="border-b-2 border-[var(--surface)] bg-[var(--background)]">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold">
            <span className="text-[var(--accent-primary)]">Fibo</span>
            <span className="text-[var(--text)]">nacho</span>
          </h1>
          <div className="flex items-center gap-3 rounded-xl bg-[var(--surface)] px-4 py-2.5">
            <span className="font-mono text-base tracking-wider text-[var(--text)]">{roomId}</span>
            <button
              onClick={handleCopy}
              className="rounded-lg p-1.5 transition-all hover:scale-110 hover:bg-[var(--background)]"
              title="Copy room code"
            >
              {copied ? (
                <Check className="h-5 w-5 text-[var(--accent-secondary)]" />
              ) : (
                <Copy className="h-5 w-5 text-[var(--text-muted)]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
