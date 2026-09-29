'use client';

import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { ArrowRight, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';

interface LiveTickerProps {
  latestEvent: ThreatEvent | null;
}

export function LiveTicker({ latestEvent }: LiveTickerProps) {
  if (!latestEvent) return null;

  return (
    <div className="bg-[#0a0a0f] border-b border-[#2a2a3a] px-4 py-2 text-xs font-mono flex items-center justify-between overflow-hidden shadow-[0_2px_15px_rgba(0,255,136,0.08)]">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-2 text-[#00ff88] font-bold tracking-wider shrink-0 uppercase text-[11px]">
          <Radio className="h-3.5 w-3.5 animate-pulse text-[#00ff88] filter drop-shadow-[0_0_4px_#00ff88]" />
          <span>&gt; TELEMETRY_FEED:</span>
        </div>
        <div className="flex items-center gap-2 truncate text-slate-300">
          <Badge risk={latestEvent.risk_level || 'medium'} variant="risk" size="sm" />
          <span className="text-slate-500 font-bold hidden sm:inline">[{latestEvent.category.toUpperCase()}]</span>
          <span className="font-semibold text-white tracking-wide truncate">{latestEvent.label || latestEvent.event_id}</span>
          <span className="text-slate-500 text-[10px] hidden md:inline tracking-wider">
            SRC:{latestEvent.source} {'//'} {formatTimeAgo(latestEvent.created_at)}
          </span>
        </div>
      </div>
      <Link
        href={`/threats/${latestEvent.event_id}`}
        className="cyber-chamfer-sm flex items-center gap-1.5 text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0a0f] border border-[#00ff88]/40 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase shrink-0 ml-4 transition-all duration-150 shadow-[0_0_8px_rgba(0,255,136,0.2)]"
      >
        <span>INSPECT</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

