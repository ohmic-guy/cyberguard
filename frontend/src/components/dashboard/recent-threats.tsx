import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { formatTimeAgo, formatConfidence } from '@/lib/utils';

interface RecentThreatsProps {
  threats: ThreatEvent[];
}

export function RecentThreats({ threats }: RecentThreatsProps) {
  const displayThreats = threats.slice(0, 5);

  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>Recent High-Risk Detections</span>
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">Live incoming alerts requiring immediate SOC triage</p>
        </div>
        <Link
          href="/threats"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
        >
          <span>View All ({threats.length})</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 divide-y divide-slate-800/80">
        {displayThreats.map((threat) => (
          <div
            key={threat.event_id}
            className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge risk={threat.risk_level || 'medium'} variant="risk" size="sm" />
                <Badge variant="outline" size="sm">
                  {threat.modality.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(threat.created_at)}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {threat.label || 'Unlabeled Security Incident'}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-2xl font-sans">
                {threat.explanation || 'No heuristic explanation available.'}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-500 block">AI Confidence</span>
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  {formatConfidence(threat.confidence)}
                </span>
              </div>
              <Link
                href={`/threats/${threat.event_id}`}
                className="rounded-lg border border-slate-700 hover:border-cyan-500/50 p-2 text-slate-300 hover:text-cyan-400 hover:bg-cyan-950/20 transition-colors"
                title="Inspect Threat"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
