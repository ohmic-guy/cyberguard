import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  details?: string;
}

export function ErrorState({
  title = 'Security Telemetry Stream Error',
  message = 'Failed to load telemetry data from CyberGuard SOC engine. The service may be restarting or uncontactable.',
  onRetry,
  details,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-500/30 bg-red-950/20 text-center max-w-lg mx-auto my-6 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
      <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm">{message}</p>

      {details && (
        <div className="w-full mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-red-400/80 hover:text-red-300 underline font-mono"
          >
            {showDetails ? 'Hide Stack Trace' : 'View Diagnostics'}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 rounded bg-slate-950 border border-red-500/20 text-[10px] text-red-300 font-mono text-left overflow-x-auto">
              {details}
            </pre>
          )}
        </div>
      )}

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-5 border-red-500/40 text-red-300 hover:bg-red-500/10 gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reconnect Feed
        </Button>
      )}
    </div>
  );
}
