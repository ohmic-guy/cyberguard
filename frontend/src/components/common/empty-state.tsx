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
  title = 'No Threat Incidents Detected',
  description = 'The ingestion pipeline is active. All monitored modalities are currently within safe baseline parameters.',
  isSearch = false,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-slate-800 bg-slate-900/40 text-center max-w-md mx-auto my-8">
      <div className="h-14 w-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
        {isSearch ? (
          <SearchX className="h-7 w-7 text-slate-400" />
        ) : (
          <ShieldCheck className="h-7 w-7 text-emerald-400" />
        )}
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
