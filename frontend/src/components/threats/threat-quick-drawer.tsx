import React, { useState } from 'react';
import Link from 'next/link';
import { ThreatEvent } from '@/types/threat';
import { Drawer } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    <Drawer isOpen={Boolean(threat)} onClose={onClose} title={`Incident: ${threat.event_id.slice(0, 18)}...`}>
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge risk={threat.risk_level || 'safe'} variant="risk" size="sm" />
              <Badge status={threat.status} variant="status" size="sm" />
              <Badge variant="default" size="sm">{threat.modality}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-[#e6edf3] leading-snug">{threat.label}</h3>
            <p className="text-[11px] text-[#8b949e]">
              Observed: {formatDate(threat.created_at)} · Source: {threat.source}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[10px] text-[#6e7681] uppercase tracking-wider font-semibold">Confidence</span>
            <span className="text-2xl font-semibold text-[#58a6ff]">
              {Math.round((threat.confidence || 0) * 100)}%
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-[#30363d]">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'border-[#58a6ff] text-[#e6edf3]'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
              activeTab === 'payload'
                ? 'border-[#58a6ff] text-[#e6edf3]'
                : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
            }`}
          >
            Raw Payload
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[200px]">
          {activeTab === 'details' ? (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-[#c9d1d9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[#6e7681]" />
                  AI Analysis Explanation
                </h4>
                <div className="p-3 bg-[#0d0f14] border border-[#21262d] rounded-md">
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    {threat.explanation || 'No neural explanation generated for this event.'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#c9d1d9] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-[#6e7681]" />
                  Indicator Breakdown
                </h4>
                <div className="space-y-2">
                  {threat.indicators && threat.indicators.length > 0 ? (
                    threat.indicators.map((ind, idx) => (
                      <div key={idx} className="p-2.5 bg-[#161b22] border border-[#21262d] rounded-md">
                        <span className="text-sm text-[#e6edf3] font-mono break-all">{ind}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#8b949e] italic p-3 bg-[#161b22] rounded-md border border-[#21262d]">
                      No explicit indicators extracted.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-[#c9d1d9] uppercase tracking-wider flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-[#6e7681]" />
                Original Ingested Data
              </h4>
              <div className="bg-[#0d0f14] border border-[#21262d] rounded-md p-3 overflow-x-auto">
                <pre className="text-xs text-[#8b949e] font-mono">
                  {JSON.stringify(threat.payload, null, 2) || '{ "status": "payload_unavailable" }'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="pt-4 mt-6 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-3">
          <Link href={`/threats/${threat.event_id}`}>
            <Button variant="primary" size="sm" className="gap-2">
              Full Investigation
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </Button>
            <Button variant="danger" size="sm" className="gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Escalate
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
