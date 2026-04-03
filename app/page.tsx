'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomId, getSessionStorage, setSessionStorage } from '@/lib/utils/room';
import { sanitizeRoomCode } from '@/lib/utils/sanitize';
import { LIMITS } from '@/lib/constants';
import NachoIcon from '@/components/icons/NachoIcon';
import Footer from '@/components/Footer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
    const sanitized = sanitizeRoomCode(roomId);
    if (sanitized) {
      router.push(`/room/${sanitized}`);
    }
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeRoomCode(e.target.value);
    setRoomId(sanitized);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center p-4 md:p-6" role="main">
        <div className="w-full max-w-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center" aria-hidden="true">
              <NachoIcon className="h-20 w-20 md:h-24 md:w-24" animate={true} />
            </div>
            <h1
              className="text-5xl leading-none font-bold tracking-tight md:text-7xl"
              id="main-heading"
            >
              <span className="text-[var(--accent-primary)]">Fibo</span>
              <span className="text-[var(--text)]">nacho</span>
            </h1>
            <p className="text-lg leading-relaxed text-[var(--text-muted)] md:text-xl">
              Nacho average pointing poker. Estimate stories, share the load!
            </p>
          </div>

          <div className="space-y-2">
            {error && (
              <div
                className="bg-opacity-10 rounded-2xl border-2 border-red-500 bg-red-500 p-4"
                role="alert"
                aria-live="polite"
              >
                <p className="text-center text-sm font-medium text-red-500">{error}</p>
              </div>
            )}
            <div>
              <Button
                onClick={handleCreateRoom}
                variant="primary"
                fullWidth
                className="py-4 text-xl font-bold focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
                aria-label="Create a new planning poker room"
              >
                Create New Room
              </Button>
            </div>

            <div className="relative py-3" aria-hidden="true">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-[var(--surface)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--background)] px-4 py-1 font-semibold text-[var(--text-muted)]">
                  or join existing
                </span>
              </div>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-2" aria-label="Join existing room">
              <label htmlFor="room-code-input" className="sr-only">
                Enter room code
              </label>
              <Input
                id="room-code-input"
                type="text"
                value={roomId}
                onChange={handleRoomCodeChange}
                placeholder="ENTER ROOM CODE"
                className="bg-[var(--surface)] px-4 py-2 text-center font-mono text-xl tracking-[0.3em] uppercase"
                maxLength={8}
                autoComplete="off"
                aria-describedby="room-code-help"
              />
              <Button
                type="submit"
                disabled={!roomId.trim()}
                variant="surface"
                fullWidth
                className="py-4 text-xl font-bold focus:ring-2 focus:ring-[var(--accent-secondary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:hover:bg-[var(--surface)] disabled:hover:text-[var(--text)]"
                aria-label="Join room with entered code"
              >
                Join Room
              </Button>
              <p id="room-code-help" className="sr-only">
                Enter an 8-character room code to join an existing planning poker session
              </p>
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
