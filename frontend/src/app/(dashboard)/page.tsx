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
import { PlusCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const { threats, metrics, isLoading, error, refetch } = useThreats();

  if (isLoading && !threats.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-[#1c1c2e] animate-pulse cyber-chamfer-sm" />
          <div className="h-8 w-32 bg-[#1c1c2e] animate-pulse cyber-chamfer-sm" />
        </div>
        <TableSkeleton rows={4} />
      </div>
    );
  }

  if (error && !threats.length) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-7 font-mono">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#2a2a3a]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="cyber-glitch text-xl sm:text-2xl lg:text-3xl font-orbitron font-black tracking-widest text-white uppercase"
              data-text="SOC MASTER COMMAND OVERVIEW"
            >
              SOC MASTER COMMAND OVERVIEW
            </h1>
            <span className="text-[#00ff88] font-bold text-xl animate-blink">_</span>
            <span className="cyber-chamfer-sm inline-flex items-center gap-1.5 bg-transparent border border-[#00ff88]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#00ff88] tracking-widest uppercase shadow-[0_0_10px_rgba(0,255,136,0.3)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88] animate-ping" />
              LIVE TELEMETRY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono tracking-wide flex items-center gap-1.5">
            <span className="text-[#00ff88]">&gt;</span>
            <span>Real-time multi-agent threat consensus, neural scoring and response orchestration.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-xs font-mono gap-1.5"
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

