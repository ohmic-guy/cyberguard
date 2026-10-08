import React, { useState } from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { Drawer } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { ShieldAlert, ExternalLink, CheckCircle2, AlertTriangle, Code, Terminal, Layers } from 'lucide-react';

interface ThreatQuickDrawerProps {
  threat: ThreatEvent | null;
  onClose: () => void;
}

export function ThreatQuickDrawer({ threat, onClose }: ThreatQuickDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'payload'>('details');

  if (!threat) return null;

  return (
    <Drawer isOpen={Boolean(threat)} onClose={onClose} title={`INCIDENT: ${threat.event_id.slice(0, 18)}...`}>
      <div className="space-y-6 font-mono text-xs">
        {/* Top Summary Banner */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-black border border-slate-800">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge risk={threat.risk_level || 'safe'} variant="risk" size="sm" />
              <Badge status={threat.status} variant="status" size="sm" />
              <span className="text-cyan-400 bg-transparent border border-cyan-500/30 px-2 py-0.5 rounded uppercase">
                {threat.modality}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans">{threat.label}</h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Observed: {formatDate(threat.created_at)} · Origin: {threat.source}
            </p>
          </div>
          <ConfidenceGauge confidence={threat.confidence || 0} size={88} strokeWidth={8} />
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'details'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Incident Overview
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-4 py-2 border-b-2 font-semibold text-xs transition-colors ${
              activeTab === 'payload'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Ingest Payload
          </button>
        </div>

        {activeTab === 'details' ? (
          <div className="space-y-5">
            {/* AI Explanation */}
            <div className="space-y-1.5 p-3.5 rounded-lg bg-black/50 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                Multi-Agent Analysis
              </span>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {threat.explanation || 'No heuristic explanation generated for this event.'}
              </p>
            </div>

            {/* Indicators of Compromise */}
            {threat.indicators?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Observed Threat Indicators ({threat.indicators.length})</span>
                </span>
                <div className="space-y-1.5">
                  {threat.indicators.map((ind, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-black/60 border border-slate-800/80 text-slate-300 text-[11px]"
                    >
                      • {ind}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Response Actions */}
            {threat.recommended_actions?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Recommended Remediation Actions</span>
                </span>
                <div className="space-y-1.5">
                  {threat.recommended_actions.map((act, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 text-[11px]"
                    >
                      {i + 1}. {act}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MITRE ATT&CK Mapping */}
            {threat.mitre_mapping?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  <span>MITRE ATT&CK Techniques</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {threat.mitre_mapping.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded bg-transparent border border-purple-500/30 text-purple-300 font-bold text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Payload Schema: {threat.modality}</span>
              </span>
              <span>application/json</span>
            </div>
            <pre className="p-4 rounded-xl bg-black border border-slate-800 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(threat.payload, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer Link to Dedicated Page */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Preview
          </Button>
          <Link href={`/threats/${threat.event_id}`}>
            <Button variant="cyber" size="sm" className="gap-1.5 text-xs">
              <span>Full Investigation</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
