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
    <Card variant="terminal" terminalTitle="INCIDENT_BUFFER // HIGH_RISK_INGESTION" className="p-0">
      <div className="flex flex-row items-center justify-between p-5 pb-4 border-b border-[#2a2a3a]">
        <div>
          <h3 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[#ff3366] filter drop-shadow-[0_0_6px_#ff3366]" />
            <span>Recent High-Risk Detections</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-mono">Live incoming alerts requiring immediate SOC triage</p>
        </div>
        <Link
          href="/threats"
          className="cyber-chamfer-sm text-xs font-mono text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0a0f] border border-[#00ff88]/40 px-3 py-1 flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-150 shadow-[0_0_8px_rgba(0,255,136,0.2)]"
        >
          <span>VIEW ALL ({threats.length})</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-[#2a2a3a]">
        {displayThreats.map((threat) => (
          <div
            key={threat.event_id}
            className="p-4 hover:bg-[#1c1c2e]/60 hover:border-l-2 hover:border-l-[#00ff88] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono"
          >
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge risk={threat.risk_level || 'medium'} variant="risk" size="sm" />
                <Badge variant="outline" size="sm">
                  {threat.modality.toUpperCase()}
                </Badge>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(threat.created_at)}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate uppercase tracking-wide">
                {threat.label || 'Unlabeled Security Incident'}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-2xl font-mono leading-relaxed">
                {threat.explanation || 'No heuristic explanation available.'}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block font-bold">
                  AI CONFIDENCE
                </span>
                <span className="text-xs font-orbitron font-bold text-[#00ff88]">
                  {formatConfidence(threat.confidence)}
                </span>
              </div>
              <Link
                href={`/threats/${threat.event_id}`}
                className="cyber-chamfer-sm border border-[#2a2a3a] hover:border-[#00ff88] p-2 text-slate-300 hover:text-[#00ff88] hover:bg-[#00ff88]/15 hover:shadow-[0_0_12px_rgba(0,255,136,0.3)] transition-all cursor-pointer"
                title="Inspect Threat"
              >
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

