'use client';

import React from 'react';
import Link from 'next/link';
import { useThreats } from '@/hooks/use-threats';
import { ThreatOverview } from '@/components/dashboard/threat-overview';
import { SeverityChart } from '@/components/dashboard/severity-chart';
import { RecentThreats } from '@/components/dashboard/recent-threats';
import { MitreMini } from '@/components/dashboard/mitre-mini';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { ShieldCheck, PlusCircle, Sparkles, RefreshCw, Radio } from 'lucide-react';

export default function DashboardPage() {
  const { threats, metrics, isLoading, error, refetch } = useThreats();

  if (isLoading && !threats.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-800 animate-pulse rounded" />
          <div className="h-8 w-32 bg-slate-800 animate-pulse rounded" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (error && !threats.length) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono flex items-center gap-2">
            <span>SOC Master Command Overview</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
              LIVE TELEMETRY
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-agent threat detection, scoring consensus and response orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-xs font-mono gap-1.5 text-slate-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Link href="/analysis/phishing">
            <Button variant="cyber" size="sm" className="text-xs font-mono gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Analyze Incident
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <ThreatOverview metrics={metrics} />

      {/* Severity Breakdown & Category Distribution */}
      <SeverityChart metrics={metrics} />

      {/* Recent Threats Feed */}
      <RecentThreats threats={threats} />

      {/* MITRE ATT&CK Mini Matrix */}
      <MitreMini />
    </div>
  );
}
