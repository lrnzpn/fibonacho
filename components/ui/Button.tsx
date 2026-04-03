import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'surface' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-2xl font-semibold transition-all focus:outline-none',
          {
            'bg-[var(--accent-primary)] text-[var(--background)] hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]':
              variant === 'primary',
            'bg-[var(--accent-secondary)] text-[var(--background)] hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]':
              variant === 'secondary',
            'bg-[var(--surface)] text-[var(--text)] hover:scale-[1.02] hover:bg-[var(--accent-secondary)] hover:text-[var(--background)] active:scale-[0.98]':
              variant === 'surface',
            'bg-[var(--background)] text-[var(--text-muted)] hover:scale-110 hover:text-[var(--accent-primary)]':
              variant === 'ghost',
            'bg-red-500 text-white hover:scale-105 active:scale-[0.98]': variant === 'danger',
          },
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-6 py-4 text-base': size === 'md',
            'px-8 py-5 text-lg': size === 'lg',
          },
          {
            'w-full': fullWidth,
          },
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
