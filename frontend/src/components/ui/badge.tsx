import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel, EventStatus } from '@/types/threat';
import { RISK_LEVEL_CONFIG, STATUS_CONFIG } from '@/lib/constants';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'cyber' | 'risk' | 'status' | 'neon';
  risk?: RiskLevel;
  status?: EventStatus;
  size?: 'sm' | 'md' | 'lg';
  chamfer?: boolean;
}

export function Badge({
  className,
  variant = 'default',
  risk,
  status,
  size = 'md',
  chamfer = true,
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 font-bold tracking-wider',
    md: 'text-[11px] px-2.5 py-1 font-bold tracking-wider',
    lg: 'text-xs px-3.5 py-1.5 font-black tracking-widest',
  };

  if (variant === 'risk' && risk) {
    const config = RISK_LEVEL_CONFIG[risk] || RISK_LEVEL_CONFIG.safe;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 border uppercase font-mono transition-all duration-200 select-none',
          chamfer ? 'cyber-chamfer-sm' : 'rounded-none',
          sizeClasses[size],
          config.badgeBg,
          config.badgeText,
          config.border,
          config.glow,
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            config.dotBg,
            risk === 'critical' ? 'animate-ping' : 'animate-pulse'
          )}
        />
        {config.label}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 border font-mono uppercase transition-all duration-200 select-none',
          chamfer ? 'cyber-chamfer-sm' : 'rounded-none',
          sizeClasses[size],
          config.color,
          className
        )}
        {...props}
      >
        {config.pulse && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_6px_#00d4ff] animate-pulse" />
        )}
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-mono uppercase tracking-wider transition-colors select-none',
        chamfer ? 'cyber-chamfer-sm' : 'rounded-none',
        sizeClasses[size],
        variant === 'default' &&
        'bg-[#12121a] text-slate-200 border border-[#2a2a3a]',
        variant === 'outline' &&
        'border border-[#2a2a3a] text-slate-300 bg-transparent hover:border-[#00ff88]/50',
        variant === 'cyber' &&
        'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.25)]',
        variant === 'neon' &&
        'bg-[#ff00ff]/15 text-[#ff00ff] border border-[#ff00ff]/50 shadow-[0_0_10px_rgba(255,0,255,0.25)]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

