import { cn } from '@/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'number';
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', fullWidth = true, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'rounded-2xl border-2 border-transparent transition-all focus:outline-none',
          {
            'bg-[var(--background)] px-5 py-4 text-lg text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)]':
              variant === 'default',
            'bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--text)] focus:border-[var(--accent-primary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none':
              variant === 'number',
          },
          {
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
