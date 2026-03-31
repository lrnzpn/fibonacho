'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import NachoIcon from '@/components/icons/NachoIcon';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8">
          <NachoIcon className="h-32 w-32 text-[var(--accent-secondary)]" />
        </div>

        <h1 className="mb-4 text-5xl font-bold text-[var(--text)]">Oops!</h1>

        <h2 className="mb-4 text-2xl font-bold text-[var(--text)]">
          Something went nacho-riously wrong!
        </h2>

        <p className="mb-8 text-[var(--text-muted)]">
          Our nachos got a bit too crispy. Don&apos;t worry, we&apos;re on it! Try refreshing the
          page or head back home.
        </p>

        {error.message && (
          <details className="mb-6 w-full rounded-lg bg-[var(--surface)] p-4 text-left">
            <summary className="cursor-pointer font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
              Technical Details
            </summary>
            <p className="mt-2 font-mono text-sm text-[var(--text-muted)]">{error.message}</p>
          </details>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={reset}
            className="rounded-xl bg-[var(--accent-primary)] px-6 py-3 font-semibold text-[var(--background)] transition-all hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none"
            aria-label="Try again"
          >
            Try Again
          </button>

          <Link
            href="/"
            className="rounded-xl border-2 border-[var(--accent-primary)] bg-transparent px-6 py-3 font-semibold text-[var(--accent-primary)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none"
            aria-label="Go back to home page"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
