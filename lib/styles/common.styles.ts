export const cardStyles = {
  base: 'rounded-xl shadow-lg',
  surface: 'bg-[var(--surface)] p-4',
  surfaceLg: 'bg-[var(--surface)] p-10',
  background: 'bg-[var(--background)] p-4',
};

export const textStyles = {
  heading: {
    h1: 'text-5xl font-bold tracking-tight md:text-7xl',
    h2: 'text-4xl font-bold',
    h3: 'text-2xl font-bold',
    h4: 'text-xl font-semibold',
  },
  body: {
    base: 'text-base text-[var(--text)]',
    muted: 'text-[var(--text-muted)]',
    small: 'text-sm text-[var(--text-muted)]',
  },
  label: 'text-sm font-semibold tracking-wide uppercase',
};

export const transitionStyles = {
  base: 'transition-all',
  scale: 'transition-all hover:scale-105',
  scaleDown: 'transition-all hover:scale-[1.02] active:scale-[0.98]',
};

export const focusStyles = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:ring-offset-2 focus:ring-offset-[var(--background)]',
  border: 'focus:outline-none focus:border-[var(--accent-primary)]',
};
