'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { InputModality, ThreatEvent } from '@/types/threat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea, Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge } from '@/components/ui/progress';
import { FileTerminal, Server, Key, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Terminal } from 'lucide-react';

export default function LogAnomalyAnalysisPage() {
  const router = useRouter();
  const [activeModality, setActiveModality] = useState<InputModality>('auth_log');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<ThreatEvent | null>(null);

  // Form states
  const [logSource, setLogSource] = useState('AWS_CloudWatch_Prod_Bastion');
  const [rawLogLines, setRawLogLines] = useState(
`Sep 18 11:14:02 prod-bastion sshd[9012]: Failed password for invalid user admin from 185.191.171.12 port 49122 ssh2
Sep 18 11:14:03 prod-bastion sshd[9014]: Failed password for invalid user root from 185.191.171.12 port 49124 ssh2
Sep 18 11:14:04 prod-bastion sshd[9016]: Failed password for invalid user deploy from 185.191.171.12 port 49126 ssh2
Sep 18 11:14:06 prod-bastion sshd[9018]: Accepted password for svc-backup-db from 185.191.171.12 port 49128 ssh2
Sep 18 11:14:07 prod-bastion sudo: svc-backup-db : TTY=pts/1 ; PWD=/home/svc-backup ; USER=root ; COMMAND=/bin/bash`
  );

  const modalityTabs = [
    { id: 'auth_log', label: 'Authentication Logs (SSO / SSH)', icon: <Key className="h-4 w-4" /> },
    { id: 'system_log', label: 'OS & Kernel Audit Logs', icon: <Server className="h-4 w-4" /> },
    { id: 'api_log', label: 'API Gateway Ingress Logs', icon: <Terminal className="h-4 w-4" /> },
  ];

  const handleSetPreset = (presetType: 'spray' | 'privesc' | 'apiscrape') => {
    if (presetType === 'spray') {
      setActiveModality('auth_log');
      setLogSource('SSO_Okta_Syslog');
      setRawLogLines(
`{"timestamp":"2026-09-18T11:20:00Z","event":"user.authentication.verify","actor":"alex.chen","result":"FAILURE","ip":"91.240.118.99"}
{"timestamp":"2026-09-18T11:20:01Z","event":"user.authentication.verify","actor":"maria.garcia","result":"FAILURE","ip":"91.240.118.99"}
{"timestamp":"2026-09-18T11:20:02Z","event":"user.authentication.verify","actor":"david.kim","result":"FAILURE","ip":"91.240.118.99"}
{"timestamp":"2026-09-18T11:20:03Z","event":"user.authentication.verify","actor":"svc-backup","result":"SUCCESS","ip":"91.240.118.99"}`
      );
    } else if (presetType === 'privesc') {
      setActiveModality('system_log');
      setLogSource('Linux_Auditd_Cluster_Node_4');
      setRawLogLines(
`type=SYSCALL msg=audit(1695029402.120:942): arch=c000003e syscall=59 success=yes exit=0 a0=7ffd9421 a1=7ffd9448 a2=7ffd9460 a3=7f exe="/usr/bin/sudo" key="privesc_monitor"
type=EXECVE msg=audit(1695029402.120:942): argc=4 a0="sudo" a1="-u" a2="root" a3="/bin/sh"
type=PATH msg=audit(1695029402.120:942): item=0 name="/etc/sudoers" nametype=NORMAL cap_fp=none cap_fi=none cap_fe=0`
      );
    } else {
      setActiveModality('api_log');
      setLogSource('Kong_APIGateway_Ingress');
      setRawLogLines(
`185.220.101.5 - - [18/Sep/2026:11:22:01 +0000] "GET /api/v1/customers/10001 HTTP/1.1" 200 489 "-" "python-requests/2.31.0"
185.220.101.5 - - [18/Sep/2026:11:22:01 +0000] "GET /api/v1/customers/10002 HTTP/1.1" 200 491 "-" "python-requests/2.31.0"
185.220.101.5 - - [18/Sep/2026:11:22:02 +0000] "GET /api/v1/customers/10003 HTTP/1.1" 200 488 "-" "python-requests/2.31.0"
185.220.101.5 - - [18/Sep/2026:11:22:02 +0000] "GET /api/v1/customers/10004 HTTP/1.1" 200 495 "-" "python-requests/2.31.0"`
      );
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnalyzedResult(null);

    const payload = {
      log_source: logSource,
      lines_count: rawLogLines.split('\n').length,
      sample_lines: rawLogLines,
    };

    try {
      const result = await api.submitAnalysis(
        activeModality === 'api_log' ? 'api_abuse' : 'log_anomaly',
        activeModality,
        `LogAnalysis_${logSource}`,
        payload
      );
      setAnalyzedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FileTerminal className="h-6 w-6 text-amber-400" />
          <span>Log Anomaly & Behavioral Threat Engine</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Statistical clustering and sequence anomaly detection across authentication events, OS audit streams, and API gateways.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={modalityTabs}
        activeTab={activeModality}
        onChange={(id) => {
          setActiveModality(id as InputModality);
          setAnalyzedResult(null);
        }}
      />

      {/* Preset Quick-Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">Quick Test Scenarios:</span>
        <button
          onClick={() => handleSetPreset('spray')}
          className="px-2.5 py-1 rounded bg-black border border-slate-800 hover:border-amber-500/50 text-amber-300 transition-colors"
        >
          Password Spray
        </button>
        <button
          onClick={() => handleSetPreset('privesc')}
          className="px-2.5 py-1 rounded bg-black border border-slate-800 hover:border-red-500/50 text-red-300 transition-colors"
        >
          Privilege Escalation
        </button>
        <button
          onClick={() => handleSetPreset('apiscrape')}
          className="px-2.5 py-1 rounded bg-black border border-slate-800 hover:border-cyan-500/50 text-cyan-300 transition-colors"
        >
          BOLA API Scrape
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-800 bg-black/80 p-5">
            <CardHeader className="p-0 pb-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white font-mono flex items-center justify-between">
                <span>Ingest & Score Log Stream</span>
                <span className="text-[10px] text-amber-400 uppercase">AgentScope Log Analysis Agent</span>
              </CardTitle>
              <CardDescription>
                Paste raw log lines or syslog entries to evaluate behavioral anomaly deviations.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleRunAnalysis} className="pt-4 space-y-4">
              <Input
                label="Log Collector / Host Identifier"
                value={logSource}
                onChange={(e) => setLogSource(e.target.value)}
                required
              />

              <Textarea
                label="Raw Log Records"
                value={rawLogLines}
                onChange={(e) => setRawLogLines(e.target.value)}
                rows={7}
                className="text-[11px] font-mono leading-relaxed"
                required
              />

              <Button
                type="submit"
                variant="cyber"
                className="w-full justify-center text-xs h-10 gap-2"
                isLoading={isSubmitting}
              >
                <Sparkles className="h-4 w-4" />
                <span>Execute Log Anomaly Model</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Real-time Analysis Result Column */}
        <div className="lg:col-span-5">
          {analyzedResult ? (
            <Card className="border-amber-500/40 bg-black/90 p-5 shadow-[0_0_20px_rgba(245,158,11,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Log Scorer Evaluation Complete</span>
                </span>
                <Badge risk={analyzedResult.risk_level || 'high'} variant="risk" size="sm" />
              </div>

              <div className="flex items-center justify-center p-3 bg-black/70 rounded-xl border border-slate-800">
                <ConfidenceGauge
                  confidence={analyzedResult.confidence || 0.88}
                  size={100}
                  strokeWidth={9}
                  label="Anomaly Probability"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent Assessment</span>
                <p className="text-slate-200 font-sans leading-relaxed">{analyzedResult.explanation}</p>
              </div>

              {analyzedResult.indicators?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Anomalous Signals</span>
                  {analyzedResult.indicators.map((ind, i) => (
                    <div key={i} className="p-2 rounded bg-black border border-slate-800 text-[11px] text-slate-300">
                      • {ind}
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/threats/${analyzedResult.event_id}`)}
                className="w-full justify-center text-xs gap-1.5 border-amber-500/40 text-amber-300 hover:bg-amber-950/30"
              >
                <span>Open Incident in SOC Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-black/40 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-black/80 border border-slate-700 flex items-center justify-center mb-3">
                <FileTerminal className="h-6 w-6 text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono">Awaiting Log Stream</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
                Paste syslog, auditd, or API access records to trigger sequence anomaly scoring.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
