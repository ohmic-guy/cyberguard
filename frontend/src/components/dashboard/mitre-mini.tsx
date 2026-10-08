import React from 'react';
import Link from 'next/link';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { TACTICS_CONFIG } from '@/lib/constants';
import { DashboardMetrics } from '@/types/threat';

interface MitreMiniProps {
  metrics: DashboardMetrics | null;
}

export function MitreMini({ metrics }: MitreMiniProps) {
  const tacticsDist = metrics?.tactic_distribution || {};

  return (
    <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
        <div className="flex items-center gap-2.5">
          <Grid3X3 className="h-4.5 w-4.5 text-[#58a6ff]" />
          <h4 className="text-sm font-medium text-[#e6edf3]">MITRE ATT&CK</h4>
        </div>
        <Link
          href="/mitre"
          className="text-xs text-[#58a6ff] hover:text-[#79b8ff] hover:underline flex items-center gap-1 font-medium transition-colors"
        >
          Matrix
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex-1 p-5 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(TACTICS_CONFIG).map(([key, config]) => {
            const count = tacticsDist[key] || 0;
            return (
              <Link
                key={key}
                href={`/mitre?tactic=${key}`}
                className="group p-3 rounded bg-[#0d0f14] border border-[#21262d] hover:border-[#30363d] transition-colors flex flex-col justify-between min-h-[80px]"
              >
                <div>
                  <div className="text-[10px] text-[#8b949e] font-medium uppercase tracking-wider mb-1">
                    {config.id}
                  </div>
                  <div className="text-xs text-[#e6edf3] font-medium leading-tight">
                    {config.name}
                  </div>
                </div>
                {count > 0 ? (
                  <span className="inline-flex mt-2 w-max items-center rounded-full bg-[#f85149]/10 px-2 py-0.5 text-[10px] font-medium text-[#f85149]">
                    {count}
                  </span>
                ) : (
                  <span className="inline-flex mt-2 w-max items-center rounded-full bg-[#21262d] px-2 py-0.5 text-[10px] font-medium text-[#6e7681]">
                    0
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
