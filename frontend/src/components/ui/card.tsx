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
  terminalTitle,
  ...props
}: CardProps) {
  // All variants render as a clean minimal card
  return (
    <div
      className={cn(
        'rounded-lg bg-[#161b22] border border-[#21262d] transition-colors duration-150',
        hoverEffect && 'hover:border-[#30363d]',
        cyberBorder && 'border-[#58a6ff]/30',
        className
      )}
      {...props}
    >
      {variant === 'terminal' && terminalTitle && (
        <div className="flex items-center justify-between border-b border-[#21262d] px-4 py-2.5 select-none">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#f85149]/70" />
            <span className="h-2 w-2 rounded-full bg-[#d29922]/70" />
            <span className="h-2 w-2 rounded-full bg-[#3fb950]/70" />
          </div>
          <span className="text-[11px] text-[#6e7681] font-medium truncate max-w-xs">
            {terminalTitle}
          </span>
          <span className="text-[10px] text-[#3fb950] font-medium">● live</span>
        </div>
      )}
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
    <div className={cn('flex flex-col space-y-1 p-5 pb-3', className)} {...props}>
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
      className={cn('text-sm font-semibold text-[#e6edf3] flex items-center gap-2', className)}
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
    <p className={cn('text-xs text-[#6e7681] leading-relaxed', className)} {...props}>
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
    <div className={cn('p-5 pt-3', className)} {...props}>
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
    <div className={cn('flex items-center p-5 pt-0 border-t border-[#21262d] mt-4', className)} {...props}>
      {children}
    </div>
  );
}
