import React from 'react';
import { DashboardMetrics } from '@/types/threat';
import { Card } from '@/components/ui/card';
import { Shield, Layers } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
      {/* Risk Severity Breakdown */}
      <Card variant="terminal" terminalTitle="SEV_CLASSIFIER // ATTACK_SURFACE" className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3a]">
          <div className="space-y-1">
            <h4 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#00ff88]" />
              <span>Risk Severity Distribution</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono">Classification across all monitored endpoints</p>
          </div>
          <span className="cyber-chamfer-sm text-[11px] font-mono font-bold text-[#00ff88] bg-[#00ff88]/15 border border-[#00ff88]/50 px-2.5 py-0.5 uppercase tracking-wider shadow-[0_0_8px_rgba(0,255,136,0.2)]">
            {totalRisks.toLocaleString()} TOTAL
          </span>
        </div>

        {/* Proportional Stacked Cyber Meter */}
        <div className="my-5">
          <div className="cyber-chamfer-sm h-4 w-full flex overflow-hidden border border-[#2a2a3a] bg-[#0a0a0f]">
            <div
              style={{ width: `${(riskDistribution.critical / totalRisks) * 100}%` }}
              className="bg-[#ff3366] shadow-[0_0_8px_#ff3366] hover:brightness-125 transition-all"
              title={`Critical: ${riskDistribution.critical}`}
            />
            <div
              style={{ width: `${(riskDistribution.high / totalRisks) * 100}%` }}
              className="bg-[#ff8800] shadow-[0_0_8px_#ff8800] hover:brightness-125 transition-all"
              title={`High: ${riskDistribution.high}`}
            />
            <div
              style={{ width: `${(riskDistribution.medium / totalRisks) * 100}%` }}
              className="bg-[#ffb800] shadow-[0_0_8px_#ffb800] hover:brightness-125 transition-all"
              title={`Medium: ${riskDistribution.medium}`}
            />
            <div
              style={{ width: `${(riskDistribution.low / totalRisks) * 100}%` }}
              className="bg-[#00d4ff] shadow-[0_0_8px_#00d4ff] hover:brightness-125 transition-all"
              title={`Low: ${riskDistribution.low}`}
            />
            <div
              style={{ width: `${(riskDistribution.safe / totalRisks) * 100}%` }}
              className="bg-[#00ff88] shadow-[0_0_8px_#00ff88] hover:brightness-125 transition-all"
              title={`Safe: ${riskDistribution.safe}`}
            />
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono text-xs">
          {(['critical', 'high', 'medium', 'low', 'safe'] as const).map((lvl) => {
            const count = riskDistribution[lvl];
            const pct = ((count / totalRisks) * 100).toFixed(1);
            const conf = RISK_LEVEL_CONFIG[lvl];

            return (
              <div
                key={lvl}
                className="cyber-chamfer-sm flex items-center justify-between p-2.5 bg-[#12121a] border border-[#2a2a3a] hover:border-[#00ff88]/40 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${conf.dotBg} shadow-[0_0_6px_currentColor]`} />
                  <span className="uppercase text-slate-300 font-bold text-[11px] tracking-wider">{lvl}</span>
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
      <Card variant="terminal" terminalTitle="AGENT_ENGINES // SPECTRUM" className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3a]">
          <div className="space-y-1">
            <h4 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#ff00ff]" />
              <span>Threat Category Breakdown</span>
            </h4>
            <p className="text-xs text-slate-400 font-mono">Autonomous ML detector agent distribution</p>
          </div>
          <span className="cyber-chamfer-sm text-[11px] font-mono font-bold text-[#ff00ff] bg-[#ff00ff]/15 border border-[#ff00ff]/50 px-2.5 py-0.5 uppercase tracking-wider shadow-[0_0_8px_rgba(255,0,255,0.2)]">
            4 CORE AGENTS
          </span>
        </div>

        <div className="mt-4 space-y-3.5 font-mono text-xs">
          {(['phishing', 'deepfake', 'log_anomaly', 'api_abuse'] as const).map((cat) => {
            const count = categoryDistribution[cat] || 0;
            const pct = Math.round((count / totalCategories) * 100);
            const conf = CATEGORY_CONFIG[cat];

            const barColor =
              cat === 'phishing'
                ? 'bg-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.7)]'
                : cat === 'deepfake'
                ? 'bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.7)]'
                : cat === 'log_anomaly'
                ? 'bg-[#ffb800] shadow-[0_0_10px_rgba(255,184,0,0.7)]'
                : 'bg-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.7)]';

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-slate-300 uppercase tracking-wide">
                  <span className="font-bold text-[11px] flex items-center gap-1.5">
                    <span className="text-slate-500">&gt;</span>
                    {conf.label}
                  </span>
                  <span className="text-slate-400">
                    <strong className="text-white font-bold">{count.toLocaleString()}</strong> ({pct}%)
                  </span>
                </div>
                <div className="cyber-chamfer-sm h-2.5 w-full bg-[#0a0a0f] overflow-hidden border border-[#2a2a3a]">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full transition-all duration-500 ${barColor}`}
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

