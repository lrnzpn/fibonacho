'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, PlusCircle } from 'lucide-react';
import { copyToClipboard, generateRoomId } from '@/lib/utils/room';
import ThemeToggle from '@/components/ThemeToggle';
import NachoIcon from '@/components/icons/NachoIcon';
import { RoomContext } from '@/contexts/RoomContext';
import { useAuth } from '@/contexts/AuthContext';

interface RoomHeaderProps {
  roomId: string;
}

export default function RoomHeader({ roomId }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const context = useContext(RoomContext);
  const { user } = useAuth();

  const room = context?.room;
  const isRoomOwner = room?.moderatorId === user?.uid;

  const handleCopy = async () => {
    const success = await copyToClipboard(roomId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleCreateNewRoom = () => {
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  return (
    <header className="border-b-2 border-[var(--surface)] bg-[var(--background)]">
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={handleGoHome}
            className="flex items-center gap-3 transition-all hover:opacity-80"
            title="Go to home"
          >
            <NachoIcon className="h-8 w-8 md:h-10 md:w-10" animate={false} />
            <h1 className="text-2xl font-bold md:text-3xl">
              <span className="text-[var(--accent-primary)]">Fibo</span>
              <span className="text-[var(--text)]">nacho</span>
            </h1>
          </button>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--surface)] px-3 py-2 md:gap-3 md:px-4 md:py-2.5">
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

        <div className="flex items-center gap-2 md:gap-3">
          {isRoomOwner && (
            <button
              onClick={handleCreateNewRoom}
              className="hidden items-center gap-2 rounded-lg bg-[var(--accent-secondary)] px-3 py-2 text-sm font-semibold text-[var(--background)] transition-all hover:scale-105 sm:flex md:px-4"
              title="Create new room"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden md:inline">New Room</span>
            </button>
          )}

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
