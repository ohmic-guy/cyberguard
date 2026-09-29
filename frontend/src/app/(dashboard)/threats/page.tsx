'use client';

import React, { useState, useMemo } from 'react';
import { useThreats } from '@/hooks/use-threats';
import { ThreatEvent, ThreatCategory, InputModality, RiskLevel } from '@/types/threat';
import { ThreatFilters } from '@/components/threats/threat-filters';
import { ThreatTable } from '@/components/threats/threat-table';
import { ThreatQuickDrawer } from '@/components/threats/threat-quick-drawer';
import { TableSkeleton } from '@/components/common/loading-skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCw, PlusCircle, Download } from 'lucide-react';

export default function ThreatsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<ThreatCategory | undefined>(undefined);
  const [modality, setModality] = useState<InputModality | undefined>(undefined);
  const [risk, setRisk] = useState<RiskLevel | undefined>(undefined);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);

  const { threats, isLoading, error, refetch } = useThreats({
    category,
    modality,
    risk,
    search,
  });

  const handleResetFilters = () => {
    setSearch('');
    setCategory(undefined);
    setModality(undefined);
    setRisk(undefined);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(threats, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cyberguard-incidents-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#2a2a3a]">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1
              className="cyber-glitch text-xl sm:text-2xl font-orbitron font-black tracking-widest text-white uppercase"
              data-text="THREAT INCIDENTS & TELEMETRY STREAM"
            >
              THREAT INCIDENTS & TELEMETRY STREAM
            </h1>
            <span className="cyber-chamfer-sm text-xs font-bold text-[#00ff88] bg-[#00ff88]/15 border border-[#00ff88]/50 px-2.5 py-0.5 uppercase tracking-wider shadow-[0_0_8px_rgba(0,255,136,0.2)]">
              {threats.length} EVENTS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            &gt; Real-time feed of multi-agent scored threats across Email, URLs, Biometric Media, and System Logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            className="text-xs font-mono gap-1.5"
            disabled={!threats.length}
          >
            <Download className="h-3.5 w-3.5" />
            Export IOCs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-xs font-mono gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <ThreatFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        modality={modality}
        onModalityChange={setModality}
        risk={risk}
        onRiskChange={setRisk}
        onReset={handleResetFilters}
      />

      {/* Main Table or Loading/Empty States */}
      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : threats.length === 0 ? (
        <EmptyState
          isSearch={Boolean(search || category || modality || risk)}
          title="No Incident Records Match Selected Filters"
          description="Try broadening your search query or reset the risk level and modality filters."
          actionLabel="Clear Active Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <ThreatTable threats={threats} onSelectThreat={setSelectedThreat} />
      )}

      {/* Slide-over Quick Drawer */}
      <ThreatQuickDrawer threat={selectedThreat} onClose={() => setSelectedThreat(null)} />
    </div>
  );
}
