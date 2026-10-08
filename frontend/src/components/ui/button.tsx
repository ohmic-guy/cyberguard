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
      sm: 'h-8 min-h-[34px] px-3.5 text-xs gap-1.5',
      md: 'h-10 min-h-[40px] px-5 text-xs gap-2',
      lg: 'h-12 min-h-[48px] px-7 text-sm gap-2.5',
      icon: 'h-10 w-10 min-h-[40px] min-w-[40px] p-0 justify-center',
    };

    const variantClasses = {
      // Default / Primary: Neon Green outline, fills with green on hover
      primary:
        'bg-transparent text-[#00ff88] border-2 border-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0a0f] hover:shadow-[0_0_16px_rgba(0,255,136,0.6)] active:scale-[0.98]',

      // Cyber / Glitch CTA: Solid electric green, high contrast dark text
      cyber:
        'bg-[#00ff88] text-[#0a0a0f] font-bold border-2 border-[#00ff88] hover:brightness-110 hover:shadow-[0_0_24px_rgba(0,255,136,0.7)] active:scale-[0.98]',

      // Secondary: Magenta / Hot Pink Neon
      secondary:
        'bg-transparent text-[#ff00ff] border-2 border-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#0a0a0f] hover:shadow-[0_0_16px_rgba(255,0,255,0.6)] active:scale-[0.98]',

      // Outline: Dark border, neon green on hover
      outline:
        'bg-transparent border border-[#2a2a3a] text-slate-300 hover:border-[#00ff88]/80 hover:text-[#00ff88] hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] active:scale-[0.98]',

      // Ghost: Subtle highlight
      ghost:
        'bg-transparent text-slate-400 hover:bg-[#00ff88]/10 hover:text-[#00ff88]',

      // Danger: Destructive Red-Pink
      danger:
        'bg-transparent text-[#ff3366] border-2 border-[#ff3366] hover:bg-[#ff3366] hover:text-white hover:shadow-[0_0_16px_rgba(255,51,102,0.6)] active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#00ff88] focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer',
          chamfer ? 'cyber-chamfer-sm' : 'rounded-none',
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

