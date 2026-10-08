import React from 'react';
import { DashboardMetrics } from '@/types/threat';
import { RISK_LEVEL_CONFIG, CATEGORY_CONFIG } from '@/lib/constants';

interface SeverityChartProps {
  metrics: DashboardMetrics | null;
}

export function SeverityChart({ metrics }: SeverityChartProps) {
  const riskDistribution = metrics?.risk_distribution || {
    critical: 18,
    high: 47,
    medium: 132,
    low: 412,
    safe: 14211,
  };

  const categoryDistribution = metrics?.category_distribution || {
    phishing: 6420,
    deepfake: 1180,
    log_anomaly: 5210,
    api_abuse: 2010,
    unknown: 0,
  };

  const totalRisks = Object.values(riskDistribution).reduce((a, b) => a + b, 0) || 1;
  const totalCategories = Object.values(categoryDistribution).reduce((a, b) => a + b, 0) || 1;

  const riskColors: Record<string, string> = {
    critical: 'bg-[#f85149]',
    high: 'bg-[#d29922]',
    medium: 'bg-[#58a6ff]',
    low: 'bg-[#3fb950]',
    safe: 'bg-[#30363d]',
  };

  const catColors: Record<string, string> = {
    phishing: 'bg-[#f85149]',
    deepfake: 'bg-[#58a6ff]',
    log_anomaly: 'bg-[#d29922]',
    api_abuse: 'bg-[#3fb950]',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Risk Distribution */}
      <div className="rounded-lg bg-[#161b22] border border-[#21262d] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-[#e6edf3]">Risk Distribution</h4>
            <p className="text-xs text-[#6e7681] mt-0.5">Across all monitored endpoints</p>
          </div>
          <span className="text-xs font-medium text-[#8b949e] bg-[#21262d] border border-[#30363d] rounded px-2 py-0.5">
            {totalRisks.toLocaleString()} total
          </span>
        </div>

        {/* Stacked bar */}
        <div className="h-2 w-full flex rounded-full overflow-hidden bg-[#21262d] mb-4">
          {(['critical', 'high', 'medium', 'low', 'safe'] as const).map((lvl) => (
            <div
              key={lvl}
              style={{ width: `${(riskDistribution[lvl] / totalRisks) * 100}%` }}
              className={`${riskColors[lvl]} transition-all`}
              title={`${lvl}: ${riskDistribution[lvl]}`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['critical', 'high', 'medium', 'low', 'safe'] as const).map((lvl) => {
            const count = riskDistribution[lvl];
            const pct = ((count / totalRisks) * 100).toFixed(1);
            return (
              <div key={lvl} className="flex items-center justify-between p-2 rounded bg-[#0d0f14] border border-[#21262d]">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${riskColors[lvl]}`} />
                  <span className="text-xs text-[#8b949e] capitalize">{lvl}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-[#c9d1d9]">{count.toLocaleString()}</span>
                  <span className="text-[10px] text-[#6e7681] ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="rounded-lg bg-[#161b22] border border-[#21262d] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-medium text-[#e6edf3]">Threat Categories</h4>
            <p className="text-xs text-[#6e7681] mt-0.5">ML detector agent distribution</p>
          </div>
          <span className="text-xs font-medium text-[#8b949e] bg-[#21262d] border border-[#30363d] rounded px-2 py-0.5">
            4 agents
          </span>
        </div>

        <div className="space-y-3">
          {(['phishing', 'deepfake', 'log_anomaly', 'api_abuse'] as const).map((cat) => {
            const count = categoryDistribution[cat] || 0;
            const pct = Math.round((count / totalCategories) * 100);
            const conf = CATEGORY_CONFIG[cat];

            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-medium text-[#8b949e]">{conf.label}</span>
                  <span className="text-xs text-[#6e7681]">
                    <strong className="text-[#c9d1d9] font-medium">{count.toLocaleString()}</strong>
                    <span className="ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#21262d] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${catColors[cat]} transition-all duration-500`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
