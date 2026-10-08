'use client';

import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo } from '@/lib/utils';

interface LiveTickerProps {
  latestEvent: ThreatEvent | null;
}

export function LiveTicker({ latestEvent }: LiveTickerProps) {
  if (!latestEvent) return null;

  return (
    <div className="bg-[#161b22] border-b border-[#21262d] px-4 py-2 text-xs flex items-center justify-between gap-4 overflow-hidden">
      <div className="flex items-center gap-3 overflow-hidden min-w-0">
        <div className="flex items-center gap-1.5 text-[#3fb950] font-medium shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3fb950] animate-pulse" />
          <span className="text-[#6e7681]">New event</span>
        </div>
        <div className="flex items-center gap-2 truncate text-[#8b949e]">
          <Badge risk={latestEvent.risk_level || 'medium'} variant="risk" size="sm" />
          <span className="text-[#6e7681] hidden sm:inline">[{latestEvent.category}]</span>
          <span className="font-medium text-[#c9d1d9] truncate">{latestEvent.label || latestEvent.event_id}</span>
          <span className="text-[#6e7681] hidden md:inline">
            · {formatTimeAgo(latestEvent.created_at)}
          </span>
        </div>
      </div>
      <Link
        href={`/threats/${latestEvent.event_id}`}
        className="flex items-center gap-1 text-[#58a6ff] hover:text-[#79b8ff] font-medium shrink-0 transition-colors"
      >
        <span>View</span>
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
