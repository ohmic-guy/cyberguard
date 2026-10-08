import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'terminal' | 'holographic';
  cyberBorder?: boolean;
  hoverEffect?: boolean;
  terminalTitle?: string;
}

export function Card({
  className,
  children,
  variant = 'default',
  cyberBorder = false,
  hoverEffect = true,
  terminalTitle = 'TERMINAL // STREAM-INSPECTOR',
  ...props
}: CardProps) {
  if (variant === 'terminal') {
    return (
      <div
        className={cn(
          'cyber-chamfer relative bg-[#0a0a0f] border border-[#2a2a3a] transition-all duration-300 overflow-hidden',
          hoverEffect && 'hover:border-[#00ff88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)]',
          cyberBorder && 'border-[#00ff88]/60 shadow-[0_0_15px_rgba(0,255,136,0.2)]',
          className
        )}
        {...props}
      >
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-[#2a2a3a] bg-[#12121a]/90 px-4 py-2 select-none">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ff3366] shadow-[0_0_4px_#ff3366]" />
            <span className="h-2 w-2 rounded-full bg-[#ffb800] shadow-[0_0_4px_#ffb800]" />
            <span className="h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_4px_#00ff88]" />
          </div>
          <span className="font-mono text-[10px] tracking-wider text-slate-400 uppercase font-semibold">
            {terminalTitle}
          </span>
          <span className="font-mono text-[10px] text-[#00ff88]/80 animate-pulse">● LIVE</span>
        </div>
        {children}
      </div>
    );
  }

  if (variant === 'holographic') {
    return (
      <div
        className={cn(
          'cyber-chamfer holographic-bracket relative bg-[#1c1c2e]/40 border border-[#00ff88]/30 backdrop-blur-md transition-all duration-300',
          'shadow-[0_0_20px_rgba(0,255,136,0.15)]',
          hoverEffect && 'hover:border-[#00ff88]/70 hover:shadow-[0_0_25px_rgba(0,255,136,0.3)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Default Variant
  return (
    <div
      className={cn(
        'cyber-chamfer relative bg-[#12121a] border border-[#2a2a3a] transition-all duration-300',
        hoverEffect && 'hover:-translate-y-0.5 hover:border-[#00ff88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.2)]',
        cyberBorder && 'border-[#00ff88]/60 shadow-[0_0_20px_rgba(0,255,136,0.25)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-5 pb-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'text-sm sm:text-base font-orbitron font-bold tracking-wider text-white uppercase flex items-center gap-2',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-400 font-mono leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 pt-2', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center p-5 pt-0 border-t border-[#2a2a3a]/80 mt-4', className)} {...props}>
      {children}
    </div>
  );
}

