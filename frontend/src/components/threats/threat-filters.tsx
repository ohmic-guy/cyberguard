import React from 'react';
import { ThreatCategory, InputModality, RiskLevel } from '@/types/threat';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ThreatFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category?: ThreatCategory;
  onCategoryChange: (val?: ThreatCategory) => void;
  modality?: InputModality;
  onModalityChange: (val?: InputModality) => void;
  risk?: RiskLevel;
  onRiskChange: (val?: RiskLevel) => void;
  onReset: () => void;
}

export function ThreatFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  modality,
  onModalityChange,
  risk,
  onRiskChange,
  onReset,
}: ThreatFiltersProps) {
  const hasActiveFilters = Boolean(search || category || modality || risk);

  return (
    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono">
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search incident ID, keyword, source, or payload..."
            className="h-10 w-full rounded-lg bg-slate-950 border border-slate-700/80 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
          {/* Risk Level Filter */}
          <select
            value={risk || ''}
            onChange={(e) => onRiskChange((e.target.value as RiskLevel) || undefined)}
            className="h-10 rounded-lg bg-slate-950 border border-slate-700/80 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="safe">Safe</option>
          </select>

          {/* Category Filter */}
          <select
            value={category || ''}
            onChange={(e) => onCategoryChange((e.target.value as ThreatCategory) || undefined)}
            className="h-10 rounded-lg bg-slate-950 border border-slate-700/80 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="phishing">Phishing</option>
            <option value="deepfake">Deepfake</option>
            <option value="log_anomaly">Log Anomaly</option>
            <option value="api_abuse">API Abuse</option>
          </select>

          {/* Modality Filter */}
          <select
            value={modality || ''}
            onChange={(e) => onModalityChange((e.target.value as InputModality) || undefined)}
            className="h-10 rounded-lg bg-slate-950 border border-slate-700/80 px-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="">All Modalities</option>
            <option value="email">Email</option>
            <option value="url">URL</option>
            <option value="sms">SMS</option>
            <option value="qr">QR Code</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="auth_log">Auth Log</option>
            <option value="system_log">System Log</option>
            <option value="api_log">API Log</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-slate-400 hover:text-white gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
