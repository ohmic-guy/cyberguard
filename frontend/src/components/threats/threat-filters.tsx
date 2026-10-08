import React from 'react';
import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThreatCategory, InputModality, RiskLevel } from '@/types/threat';

interface ThreatFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  category?: ThreatCategory;
  onCategoryChange: (val: ThreatCategory | undefined) => void;
  modality?: InputModality;
  onModalityChange: (val: InputModality | undefined) => void;
  risk?: RiskLevel;
  onRiskChange: (val: RiskLevel | undefined) => void;
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
    <div className="flex flex-col xl:flex-row gap-4 w-full p-4 rounded-lg bg-[#161b22] border border-[#30363d]">
      <div className="flex-1 w-full xl:max-w-md">
        <Input
          type="text"
          placeholder="Search incident logs..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={modality || ''}
          onChange={(e) => onModalityChange((e.target.value as InputModality) || undefined)}
          className="h-9 rounded-md bg-[#0d0f14] border border-[#30363d] px-3 py-1 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Modalities</option>
          <option value="log_anomaly">Log Anomaly</option>
          <option value="phishing">Phishing</option>
          <option value="deepfake">Deepfake Media</option>
          <option value="api_abuse">API Abuse</option>
        </select>

        <select
          value={risk || ''}
          onChange={(e) => onRiskChange((e.target.value as RiskLevel) || undefined)}
          className="h-9 rounded-md bg-[#0d0f14] border border-[#30363d] px-3 py-1 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
        >
          <option value="">All Risks</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="safe">Safe</option>
        </select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-9 px-3 gap-1.5 text-xs text-[#f85149] hover:bg-[#f85149]/10 hover:text-[#f85149]">
            <FilterX className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
