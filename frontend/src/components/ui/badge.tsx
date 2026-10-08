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

const RISK_MINIMAL: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: 'bg-[#f85149]/10 border border-[#f85149]/30', text: 'text-[#f85149]', dot: 'bg-[#f85149]' },
  high:     { bg: 'bg-[#d29922]/10 border border-[#d29922]/30', text: 'text-[#d29922]', dot: 'bg-[#d29922]' },
  medium:   { bg: 'bg-[#58a6ff]/10 border border-[#58a6ff]/25', text: 'text-[#58a6ff]', dot: 'bg-[#58a6ff]' },
  low:      { bg: 'bg-[#3fb950]/10 border border-[#3fb950]/25', text: 'text-[#3fb950]', dot: 'bg-[#3fb950]' },
  safe:     { bg: 'bg-[#8b949e]/10 border border-[#30363d]',    text: 'text-[#8b949e]',  dot: 'bg-[#8b949e]' },
};

export function Badge({
  className,
  variant = 'default',
  risk,
  status,
  size = 'md',
  chamfer,
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
  };

  if (variant === 'risk' && risk) {
    const r = RISK_MINIMAL[risk] || RISK_MINIMAL.safe;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded font-medium uppercase tracking-wide',
          sizeClasses[size],
          r.bg,
          r.text,
          className
        )}
        {...props}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', r.dot)} />
        {risk}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.received;
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded font-medium border border-[#30363d] text-[#8b949e] bg-[#161b22] uppercase tracking-wide',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {config.pulse && (
          <span className="h-1.5 w-1.5 rounded-full bg-[#58a6ff] animate-pulse flex-shrink-0" />
        )}
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium border border-[#30363d] text-[#8b949e] bg-[#161b22] uppercase tracking-wide',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
