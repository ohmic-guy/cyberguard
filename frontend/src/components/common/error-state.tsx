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
  title = 'Failed to load',
  message = 'Could not load data from the SOC engine. The connection may be unstable.',
  onRetry,
  details,
}: ErrorStateProps) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-[#f85149]/25 bg-[#161b22] text-center max-w-md mx-auto my-6">
      <div className="h-10 w-10 rounded-full bg-[#f85149]/10 border border-[#f85149]/25 flex items-center justify-center mb-4">
        <AlertTriangle className="h-5 w-5 text-[#f85149]" />
      </div>
      <h3 className="text-sm font-medium text-[#e6edf3]">{title}</h3>
      <p className="text-xs text-[#6e7681] mt-2 leading-relaxed max-w-sm">{message}</p>

      {details && (
        <div className="w-full mt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-[#58a6ff] hover:underline cursor-pointer"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-[#0d0f14] border border-[#21262d] rounded text-[10px] text-[#8b949e] text-left overflow-x-auto">
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
          className="mt-5 gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}

