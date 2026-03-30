'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomId, getSessionStorage, setSessionStorage } from '@/lib/utils/room';
import { LIMITS } from '@/lib/constants';
import NachoIcon from '@/components/icons/NachoIcon';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    const lastCreationTime = getSessionStorage('lastRoomCreation');
    const now = Date.now();

    if (lastCreationTime) {
      const timeSinceLastCreation = now - parseInt(lastCreationTime);
      if (timeSinceLastCreation < LIMITS.ROOM_CREATION_COOLDOWN_MS) {
        const remainingSeconds = Math.ceil(
          (LIMITS.ROOM_CREATION_COOLDOWN_MS - timeSinceLastCreation) / 1000
        );
        setError(`Please wait ${remainingSeconds} seconds before creating another room`);
        setTimeout(() => setError(''), 3000);
        return;
      }
    }

    setSessionStorage('lastRoomCreation', now.toString());
    const newRoomId = generateRoomId();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      router.push(`/room/${roomId.trim()}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center">
              <NachoIcon className="h-20 w-20 md:h-24 md:w-24" animate={true} />
            </div>
            <h1 className="text-5xl leading-none font-bold tracking-tight md:text-7xl">
              <span className="text-[var(--accent-primary)]">Fibo</span>
              <span className="text-[var(--text)]">nacho</span>
            </h1>
            <p className="text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
              Nacho average pointing poker. Estimate stories, share the load!
            </p>
          </div>

          <div className="space-y-2">
            {error && (
              <div className="bg-opacity-10 rounded-2xl border-2 border-red-500 bg-red-500 p-4">
                <p className="text-center text-sm font-medium text-red-500">{error}</p>
              </div>
            )}
            <div>
              <button
                onClick={handleCreateRoom}
                className="w-full rounded-2xl bg-[var(--accent-primary)] px-8 py-4 text-xl font-bold text-[var(--background)] transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
              >
                Create New Room
              </button>
            </div>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[var(--surface)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--background)] px-4 py-1 font-semibold text-[var(--text-muted)]">
                  or join existing
                </span>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-2">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="ENTER ROOM CODE"
                className="w-full rounded-2xl border-2 border-transparent bg-[var(--surface)] px-4 py-2 text-center font-mono text-xl tracking-[0.3em] text-[var(--text)] uppercase transition-all placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none"
                maxLength={8}
                autoComplete="off"
              />
              <button
                type="submit"
                disabled={!roomId.trim()}
                className="w-full rounded-2xl bg-[var(--surface)] px-8 py-4 text-xl font-bold text-[var(--text)] transition-all hover:scale-[1.02] hover:bg-[var(--accent-secondary)] hover:text-[var(--background)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--text)]"
              >
                Join Room
              </button>
            </form>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm leading-relaxed text-[var(--text-muted)] md:text-base">
              No sign-up required. Start estimating in seconds.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
