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
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-36 bg-[#21262d] animate-pulse rounded" />
          <div className="h-8 w-28 bg-[#21262d] animate-pulse rounded" />
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
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-semibold text-[#e6edf3] tracking-tight">
              SOC Overview
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#3fb950]/10 border border-[#3fb950]/25 px-2 py-0.5 text-[10px] font-medium text-[#3fb950]">
              <span className="h-1 w-1 rounded-full bg-[#3fb950] animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-[#6e7681]">
            Real-time multi-agent threat detection and response.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>

          <Link href="/analysis/phishing">
            <Button variant="primary" size="sm" className="gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" />
              Analyze
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
      <MitreMini metrics={metrics} />
    </div>
  );
}

