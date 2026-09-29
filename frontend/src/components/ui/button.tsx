import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cyber' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    const variantClasses = {
      primary: 'bg-cyan-600 hover:bg-cyan-500 text-white font-medium shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30 active:scale-[0.98]',
      cyber: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-[0_0_16px_rgba(6,182,212,0.4)] border border-cyan-400/50',
      outline: 'bg-transparent border border-slate-700 hover:border-slate-500 hover:bg-slate-800/60 text-slate-200',
      ghost: 'bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-white',
      danger: 'bg-red-600/90 hover:bg-red-500 text-white font-medium border border-red-400/30 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
