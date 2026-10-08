import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title = 'No active threats detected',
  message = 'All monitored endpoints and data streams are clear. Agents are standing by.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-[#21262d] rounded-lg bg-[#161b22] text-center max-w-md mx-auto my-8">
      <div className="h-14 w-14 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/25 flex items-center justify-center mb-4">
        <ShieldCheck className="h-7 w-7 text-[#3fb950]" />
      </div>
      <h3 className="text-sm font-medium text-[#e6edf3]">{title}</h3>
      <p className="text-xs text-[#6e7681] mt-2 leading-relaxed max-w-sm">{message}</p>

      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
