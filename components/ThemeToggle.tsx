'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window === 'undefined') return 'dark';
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (prefersDark ? 'dark' : 'light');
  });

  const applyTheme = (newTheme: 'dark' | 'light') => {
    if (typeof window === 'undefined') return;
    if (newTheme === 'light') {
      document.documentElement.setAttribute('data-theme', 'sunny');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg bg-[var(--surface)] p-2 transition-all hover:scale-110 hover:bg-[var(--background)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:outline-none"
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'light'}
    >
      {theme === 'dark' ? (
        <Sun className="h-6 w-6 text-[var(--accent-primary)]" aria-hidden="true" />
      ) : (
        <Moon className="h-6 w-6 text-[var(--accent-primary)]" aria-hidden="true" />
      )}
    </button>
  );
}
