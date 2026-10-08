import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldAlert, Clock } from 'lucide-react';
import { formatTimeAgo, formatConfidence } from '@/lib/utils';

interface RecentThreatsProps {
  threats: ThreatEvent[];
}

export function RecentThreats({ threats }: RecentThreatsProps) {
  const displayThreats = threats.slice(0, 5);

  return (
    <div className="rounded-lg bg-[#161b22] border border-[#21262d] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#21262d]">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#f85149]" />
          <h3 className="text-sm font-medium text-[#e6edf3]">Recent Detections</h3>
        </div>
        <Link
          href="/threats"
          className="text-xs text-[#58a6ff] hover:text-[#79b8ff] font-medium transition-colors flex items-center gap-1"
        >
          View all ({threats.length})
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#21262d]">
        {displayThreats.map((threat) => (
          <div
            key={threat.event_id}
            className="px-5 py-3.5 hover:bg-[#1c2128] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge risk={threat.risk_level || 'medium'} variant="risk" size="sm" />
                <Badge variant="default" size="sm">
                  {threat.modality}
                </Badge>
                <span className="text-[10px] text-[#6e7681] flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(threat.created_at)}
                </span>
              </div>
              <p className="text-sm font-medium text-[#c9d1d9] truncate">
                {threat.label || 'Unlabeled Security Incident'}
              </p>
              <p className="text-xs text-[#6e7681] truncate max-w-2xl">
                {threat.explanation || 'No explanation available.'}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-[10px] text-[#6e7681] block">Confidence</span>
                <span className="text-sm font-semibold text-[#3fb950]">
                  {formatConfidence(threat.confidence)}
                </span>
              </div>
              <Link
                href={`/threats/${threat.event_id}`}
                className="p-1.5 rounded-md border border-[#30363d] hover:border-[#58a6ff]/40 hover:bg-[#58a6ff]/5 text-[#6e7681] hover:text-[#58a6ff] transition-colors"
                title="Inspect Threat"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
