import React from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo, formatConfidence } from '@/lib/utils';
import { ArrowRight, Eye, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

interface ThreatTableProps {
  threats: ThreatEvent[];
  onSelectThreat: (threat: ThreatEvent) => void;
}

export function ThreatTable({ threats, onSelectThreat }: ThreatTableProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-black overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-black text-slate-400">
              <th className="py-3 px-4 font-semibold">Incident ID & Time</th>
              <th className="py-3 px-4 font-semibold">Classification</th>
              <th className="py-3 px-4 font-semibold">Detection Summary</th>
              <th className="py-3 px-4 font-semibold text-center">Risk Level</th>
              <th className="py-3 px-4 font-semibold">Confidence</th>
              <th className="py-3 px-4 font-semibold">Status</th>
              <th className="py-3 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {threats.map((threat) => (
              <tr
                key={threat.event_id}
                onClick={() => onSelectThreat(threat)}
                className="hover:bg-black/50 cursor-pointer transition-colors group"
              >
                {/* ID & Timestamp */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-bold text-slate-200 block group-hover:text-cyan-400 transition-colors">
                    {threat.event_id.slice(0, 16)}...
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(threat.created_at)}
                  </span>
                </td>

                {/* Modality & Category */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-300 uppercase text-[11px]">
                      {threat.category}
                    </span>
                    <span className="text-[10px] text-cyan-400 bg-transparent border border-cyan-500/20 px-1.5 py-0.5 rounded w-fit uppercase">
                      {threat.modality}
                    </span>
                  </div>
                </td>

                {/* Detection Label */}
                <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                  <p className="font-semibold text-white truncate text-xs">
                    {threat.label || 'Unlabeled Security Anomaly'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate max-w-sm font-sans mt-0.5">
                    {threat.explanation || 'Anomaly detected via automated detector pipeline.'}
                  </p>
                </td>

                {/* Risk Level */}
                <td className="py-3.5 px-4 text-center whitespace-nowrap">
                  <Badge risk={threat.risk_level || 'safe'} variant="risk" size="sm" />
                </td>

                {/* Confidence */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="space-y-1 w-24">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Score</span>
                      <span className="font-bold text-white">{formatConfidence(threat.confidence)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${Math.round((threat.confidence || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge status={threat.status} variant="status" size="sm" />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectThreat(threat);
                      }}
                      className="p-1.5 rounded-lg border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-400 transition-colors"
                      title="Quick Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      href={`/threats/${threat.event_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-slate-700/80 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300 hover:text-cyan-400 transition-colors"
                      title="Full Deep-Dive"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
