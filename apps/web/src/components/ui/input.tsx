import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md px-3 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
          // Liquid Glass effect for inputs
          'border-white/40 bg-white/10 placeholder:text-card-foreground/50 text-card-foreground py-3',
          'focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white/15',
          'transition-all duration-200',
          // Dark mode
          'dark:border-white/20 dark:bg-white/5 dark:ring-offset-zinc-950 dark:focus:ring-blue-500',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
