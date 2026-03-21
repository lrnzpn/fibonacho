'use client';

import { Coffee } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-[var(--surface)] bg-[var(--background)] py-6">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            Made with 🌮 and ❤️ for agile teams everywhere
          </p>
          <a
            href="https://ko-fi.com/migel010"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition-all hover:scale-105 hover:bg-[var(--accent-primary)] hover:text-[var(--background)]"
          >
            <Coffee className="h-4 w-4" />
            <span>Buy me a nacho on Ko-fi</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
