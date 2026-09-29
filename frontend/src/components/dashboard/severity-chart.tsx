import React from 'react';
import { DashboardMetrics } from '@/types/threat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield, Layers, Radio, Cpu } from 'lucide-react';
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Risk Severity Breakdown */}
      <Card className="border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Risk Severity Distribution</span>
            </h4>
            <p className="text-xs text-slate-400">Classification across all monitored endpoints</p>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
            {totalRisks.toLocaleString()} total
          </span>
        </div>

        {/* Proportional Stacked Meter */}
        <div className="my-5">
          <div className="h-4 w-full flex rounded-full overflow-hidden border border-slate-700/60 bg-slate-950">
            <div
              style={{ width: `${(riskDistribution.critical / totalRisks) * 100}%` }}
              className="bg-red-500 hover:opacity-90 transition-all"
              title={`Critical: ${riskDistribution.critical}`}
            />
            <div
              style={{ width: `${(riskDistribution.high / totalRisks) * 100}%` }}
              className="bg-orange-500 hover:opacity-90 transition-all"
              title={`High: ${riskDistribution.high}`}
            />
            <div
              style={{ width: `${(riskDistribution.medium / totalRisks) * 100}%` }}
              className="bg-amber-500 hover:opacity-90 transition-all"
              title={`Medium: ${riskDistribution.medium}`}
            />
            <div
              style={{ width: `${(riskDistribution.low / totalRisks) * 100}%` }}
              className="bg-sky-500 hover:opacity-90 transition-all"
              title={`Low: ${riskDistribution.low}`}
            />
            <div
              style={{ width: `${(riskDistribution.safe / totalRisks) * 100}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all"
              title={`Safe: ${riskDistribution.safe}`}
            />
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
          {(['critical', 'high', 'medium', 'low', 'safe'] as const).map((lvl) => {
            const count = riskDistribution[lvl];
            const pct = ((count / totalRisks) * 100).toFixed(1);
            const conf = RISK_LEVEL_CONFIG[lvl];

            return (
              <div
                key={lvl}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${conf.dotBg}`} />
                  <span className="capitalize text-slate-300 font-semibold">{lvl}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-bold block">{count.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modality & Threat Category Distribution */}
      <Card className="border-slate-800 bg-slate-900/60 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Layers className="h-4 w-4 text-purple-400" />
              <span>Threat Category Breakdown</span>
            </h4>
            <p className="text-xs text-slate-400">Autonomous ML detector agent distribution</p>
          </div>
          <span className="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded">
            4 Core Agents
          </span>
        </div>

        <div className="mt-4 space-y-3 font-mono text-xs">
          {(['phishing', 'deepfake', 'log_anomaly', 'api_abuse'] as const).map((cat) => {
            const count = categoryDistribution[cat] || 0;
            const pct = Math.round((count / totalCategories) * 100);
            const conf = CATEGORY_CONFIG[cat];

            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">{conf.label}</span>
                  <span className="text-slate-400">
                    <strong className="text-white">{count.toLocaleString()}</strong> ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      cat === 'phishing'
                        ? 'bg-purple-500'
                        : cat === 'deepfake'
                        ? 'bg-pink-500'
                        : cat === 'log_anomaly'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
