'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ThreatEvent } from '@/types/threat';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge, ProgressBar } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatConfidence } from '@/lib/utils';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  Radio,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ErrorState } from '@/components/common/error-state';
import { Skeleton } from '@/components/common/loading-skeleton';

export default function ThreatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [threat, setThreat] = useState<ThreatEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadThreat() {
      setIsLoading(true);
      try {
        const data = await api.getThreatById(id);
        setThreat(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) loadThreat();
  }, [id]);

  const handleCopyId = () => {
    if (threat) {
      navigator.clipboard.writeText(threat.event_id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!threat) {
    return (
      <div className="space-y-6">
        <Link href="/threats" className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Incidents</span>
        </Link>
        <ErrorState
          title="Incident Not Found"
          message={`No threat record was found matching ID: ${id}. It may have expired from cache or was purged.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Back button & top actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <Link
          href="/threats"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Threat Stream</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="text-xs text-slate-300 gap-1.5"
          >
            {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedId ? 'Copied UUID' : 'Copy Incident ID'}</span>
          </Button>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge risk={threat.risk_level || 'safe'} variant="risk" size="md" />
              <Badge status={threat.status} variant="status" size="md" />
              <span className="text-xs text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 rounded font-bold uppercase">
                {`${threat.category} // ${threat.modality}`}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
              {threat.label || 'Unlabeled Security Incident'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                Detected: <strong className="text-slate-200">{formatDate(threat.created_at)}</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-slate-500" />
                Source: <strong className="text-slate-200">{threat.source}</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500 font-mono text-[11px]">ID: {threat.event_id}</span>
            </div>
          </div>

          {/* Large Confidence Dial */}
          <div className="shrink-0 flex items-center justify-center bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <ConfidenceGauge
              confidence={threat.confidence || 0}
              size={120}
              strokeWidth={10}
              label="Consensus Score"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Analysis, Indicators, Actions, MITRE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Explanation Section */}
          <Card className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="h-4 w-4 text-cyan-400" />
              <span>Multi-Agent Threat Explanation</span>
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {threat.explanation || 'No deep reasoning output provided by the scorer agent.'}
            </p>

            {threat.score_factors?.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Contributing Scoring Factors
                </span>
                <ul className="space-y-1 text-xs text-slate-300 font-sans">
                  {threat.score_factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono">▸</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Threat Indicators Section (IOCs) */}
          <Card className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Observed Threat Indicators ({threat.indicators.length})</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Heuristic Signatures
              </span>
            </div>
            <div className="space-y-2">
              {threat.indicators.map((indicator, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                >
                  <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <span className="font-mono">{indicator}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Remediation Actions Checklist */}
          <Card className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>SOC Remediation Playbook</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Interactive Checklist
              </span>
            </div>
            <div className="space-y-2">
              {threat.recommended_actions.map((action, i) => {
                const isDone = completedActions[i];
                return (
                  <div
                    key={i}
                    onClick={() => toggleAction(i)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/40 opacity-75'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                          : 'border-slate-600 bg-slate-900'
                      }`}
                    >
                      {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div className="flex-1">
                      <span
                        className={`text-xs font-sans ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100 font-medium'
                        }`}
                      >
                        {action}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: MITRE & Payload */}
        <div className="space-y-6">
          {/* MITRE ATT&CK Mapping */}
          <Card className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>MITRE ATT&CK Mapping</span>
            </h3>
            {threat.mitre_mapping?.length > 0 ? (
              <div className="space-y-2">
                {threat.mitre_mapping.map((techId) => (
                  <div
                    key={techId}
                    className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex items-center justify-between"
                  >
                    <span className="text-xs font-bold text-purple-300">{techId}</span>
                    <a
                      href={`https://attack.mitre.org/techniques/${techId.replace('.', '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
                    >
                      <span>Matrix</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No adversary technique associated with this benign event.</p>
            )}
          </Card>

          {/* Raw Payload Inspector */}
          <Card className="border-slate-800 bg-slate-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Raw Ingestion Payload</span>
              </h3>
              <span className="text-[10px] text-slate-500 uppercase">{threat.modality}</span>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 text-[11px] text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(threat.payload, null, 2)}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}
