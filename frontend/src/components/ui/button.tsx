import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cyber' | 'outline' | 'ghost' | 'danger' | 'secondary';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  chamfer?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading,
      disabled,
      children,
      chamfer = true,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-10 px-5 text-sm gap-2',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    const variantClasses = {
      primary:
        'bg-[#238636] text-white border border-[#2ea043] hover:bg-[#2ea043] active:bg-[#238636]',
      cyber:
        'bg-[#58a6ff] text-[#0d1117] font-semibold border border-[#58a6ff] hover:bg-[#79b8ff] active:bg-[#58a6ff]',
      secondary:
        'bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] hover:border-[#8b949e]',
      outline:
        'bg-transparent border border-[#30363d] text-[#c9d1d9] hover:bg-[#161b22] hover:border-[#8b949e]',
      ghost:
        'bg-transparent text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]',
      danger:
        'bg-transparent text-[#f85149] border border-[#f85149]/40 hover:bg-[#f85149]/10 hover:border-[#f85149]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#58a6ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0f14] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
