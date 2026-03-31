'use client';

import Link from 'next/link';
import NachoIcon from '@/components/icons/NachoIcon';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8 animate-bounce">
          <NachoIcon className="h-32 w-32 text-[var(--accent-primary)]" />
        </div>

        <h1 className="mb-4 text-6xl font-bold text-[var(--text)]">404</h1>

        <h2 className="mb-4 text-2xl font-bold text-[var(--text)]">This is nacho business!</h2>

        <p className="mb-8 text-lg text-[var(--text-muted)]">
          Looks like you&apos;ve wandered into uncharted nacho territory. This page doesn&apos;t
          exist, but don&apos;t worry—we&apos;ll get you back to the good stuff!
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-[var(--accent-primary)] px-6 py-3 font-semibold text-[var(--background)] transition-all hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none"
            aria-label="Go back to home page"
          >
            Take Me Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="rounded-xl border-2 border-[var(--accent-primary)] bg-transparent px-6 py-3 font-semibold text-[var(--accent-primary)] transition-all hover:bg-[var(--accent-primary)] hover:text-[var(--background)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none"
            aria-label="Go back to previous page"
          >
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
