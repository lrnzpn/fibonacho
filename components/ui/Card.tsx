import { cn } from '@/lib/utils/cn';
import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'background';
  padding?: 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'surface', padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl shadow-lg',
          {
            'bg-[var(--surface)]': variant === 'surface',
            'bg-[var(--background)]': variant === 'background',
          },
          {
            'p-2': padding === 'sm',
            'p-4': padding === 'md',
            'p-10': padding === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
