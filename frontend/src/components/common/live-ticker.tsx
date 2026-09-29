'use client';

import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { ShieldAlert, ArrowRight, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';

interface LiveTickerProps {
  latestEvent: ThreatEvent | null;
}

export function LiveTicker({ latestEvent }: LiveTickerProps) {
  if (!latestEvent) return null;

  return (
    <div className="bg-slate-950/90 border-b border-cyan-500/20 px-4 py-2 text-xs font-mono flex items-center justify-between overflow-hidden shadow-[0_2px_10px_rgba(6,182,212,0.05)]">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold shrink-0">
          <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
          <span>LIVE TELEMETRY:</span>
        </div>
        <div className="flex items-center gap-2 truncate text-slate-300">
          <Badge risk={latestEvent.risk_level || 'medium'} variant="risk" size="sm" />
          <span className="text-slate-400 hidden sm:inline">[{latestEvent.category.toUpperCase()}]</span>
          <span className="font-semibold text-white truncate">{latestEvent.label || latestEvent.event_id}</span>
          <span className="text-slate-500 text-[11px] hidden md:inline">
            via {latestEvent.source} ({formatTimeAgo(latestEvent.created_at)})
          </span>
        </div>
      </div>
      <Link
        href={`/threats/${latestEvent.event_id}`}
        className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 shrink-0 font-semibold pl-4"
      >
        <span>Inspect</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
