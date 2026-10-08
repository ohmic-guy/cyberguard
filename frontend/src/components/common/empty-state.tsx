import React from 'react';
import { ShieldCheck, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  isSearch?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'NO THREAT INCIDENTS DETECTED',
  description = 'The ingestion pipeline is active. All monitored modalities are currently within safe baseline parameters.',
  isSearch = false,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="cyber-chamfer flex flex-col items-center justify-center p-12 border border-[#2a2a3a] bg-[#12121a] text-center max-w-md mx-auto my-8 font-mono shadow-[0_0_20px_rgba(0,255,136,0.1)]">
      <div className="cyber-chamfer-sm h-14 w-14 bg-[#00ff88]/10 border border-[#00ff88]/50 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(0,255,136,0.3)]">
        {isSearch ? (
          <SearchX className="h-7 w-7 text-slate-400" />
        ) : (
          <ShieldCheck className="h-7 w-7 text-[#00ff88] filter drop-shadow-[0_0_6px_#00ff88]" />
        )}
      </div>
      <h3 className="text-base font-orbitron font-bold text-white tracking-wide uppercase">{title}</h3>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed font-mono">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

