import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel, EventStatus } from '@/types/threat';
import { RISK_LEVEL_CONFIG, STATUS_CONFIG } from '@/lib/constants';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'cyber' | 'risk' | 'status';
  risk?: RiskLevel;
  status?: EventStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({
  className,
  variant = 'default',
  risk,
  status,
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-semibold tracking-wide',
    lg: 'text-sm px-3 py-1.5 font-bold tracking-wider',
  };

  if (variant === 'risk' && risk) {
    const config = RISK_LEVEL_CONFIG[risk] || RISK_LEVEL_CONFIG.safe;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded border uppercase font-mono transition-all',
          sizeClasses[size],
          config.badgeBg,
          config.badgeText,
          config.border,
          config.glow,
          className
        )}
        {...props}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dotBg, risk === 'critical' && 'animate-ping')} />
        {config.label}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-slate-700/60 font-mono transition-all',
          sizeClasses[size],
          config.color,
          className
        )}
        {...props}
      >
        {config.pulse && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />}
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md font-mono transition-colors',
        sizeClasses[size],
        variant === 'default' && 'bg-slate-800/80 text-slate-200 border border-slate-700',
        variant === 'outline' && 'border border-slate-600/80 text-slate-300 bg-transparent',
        variant === 'cyber' && 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
