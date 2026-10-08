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
  title = 'TELEMETRY STREAM CORRUPTED',
  message = 'Failed to load telemetry stream from CyberGuard SOC engine. The neural node may be rebooting or connection is unstable.',
  onRetry,
  details,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="cyber-chamfer flex flex-col items-center justify-center p-8 border border-[#ff3366]/40 bg-[#12121a] text-center max-w-lg mx-auto my-6 shadow-[0_0_25px_rgba(255,51,102,0.2)] font-mono">
      <div className="cyber-chamfer-sm h-12 w-12 bg-[#ff3366]/15 border border-[#ff3366]/60 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,51,102,0.4)]">
        <AlertTriangle className="h-6 w-6 text-[#ff3366]" />
      </div>
      <h3 className="text-base font-orbitron font-bold text-white tracking-wide uppercase">{title}</h3>
      <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm font-mono">{message}</p>

      {details && (
        <div className="w-full mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-[#ff3366] hover:underline font-mono uppercase tracking-wider cursor-pointer"
          >
            {showDetails ? '[ - HIDE DIAGNOSTICS ]' : '[ + VIEW DIAGNOSTICS ]'}
          </button>
          {showDetails && (
            <pre className="cyber-chamfer-sm mt-2 p-3 bg-[#0a0a0f] border border-[#ff3366]/30 text-[10px] text-[#ff3366]/90 font-mono text-left overflow-x-auto">
              {details}
            </pre>
          )}
        </div>
      )}

      {onRetry && (
        <Button
          variant="danger"
          size="sm"
          onClick={onRetry}
          className="mt-5 gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reconnect Feed
        </Button>
      )}
    </div>
  );
}

