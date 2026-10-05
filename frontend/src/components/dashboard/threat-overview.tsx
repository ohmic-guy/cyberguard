import React from 'react';
import { DashboardMetrics } from '@/types/threat';

interface ThreatOverviewProps {
  metrics: DashboardMetrics | null;
}

export function ThreatOverview({ metrics: m }: ThreatOverviewProps) {
  const stats = [
    {
      code: 'SYS-01',
      channel: 'INGEST // PIPELINE',
      title: 'TOTAL SCANNED EVENTS',
      value: m?.total_events?.toLocaleString() ?? '14,822',
      sub: '+340 / MIN',
      subLabel: 'THROUGHPUT',
      accent: '#00ff88',
      accentRgb: '0,255,136',
      statusDot: 'bg-[#00ff88] animate-ping',
      statusText: 'NOMINAL',
      bars: [4, 6, 5, 8, 7, 9, 10, 8, 9, 11, 10, 12],
    },
    {
      code: 'SEC-04',
      channel: 'CRITICAL // TRIAGE',
      title: 'CRITICAL THREAT INCIDENTS',
      value: String(m?.critical_threats ?? 3),
      sub: 'ACTION REQUIRED',
      subLabel: 'SEVERITY',
      accent: '#ff3366',
      accentRgb: '255,51,102',
      statusDot: 'bg-[#ff3366] animate-ping',
      statusText: 'ELEVATED',
      bars: [2, 1, 3, 2, 4, 3, 5, 4, 3, 5, 4, 6],
    },
    {
      code: 'ALR-02',
      channel: 'HIGH // ESCALATION',
      title: 'HIGH PRIORITY ALERTS',
      value: String(m?.high_threats ?? 3),
      sub: 'ESCALATED L2 SOC',
      subLabel: 'QUEUE',
      accent: '#ff8800',
      accentRgb: '255,136,0',
      statusDot: 'bg-[#ff8800] animate-pulse',
      statusText: 'ACTIVE',
      bars: [3, 4, 2, 5, 3, 4, 6, 5, 4, 6, 5, 7],
    },
    {
      code: 'AI-CORE',
      channel: 'NEURAL // CONSENSUS',
      title: 'AVG AI CONFIDENCE',
      value: `${Math.round((m?.avg_confidence ?? 0.91) * 100)}%`,
      sub: 'NEURAL CONSENSUS',
      subLabel: 'INFERENCE',
      accent: '#ff00ff',
      accentRgb: '255,0,255',
      statusDot: 'bg-[#ff00ff] animate-pulse',
      statusText: 'SYNCED',
      bars: [8, 9, 8, 10, 9, 10, 11, 9, 10, 11, 10, 12],
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
      {stats.map((s) => (
        <div
          key={s.code}
          className="relative flex flex-col bg-[#0a0a0f] border border-[#1e1e2e] overflow-hidden transition-all duration-300 group"
          style={{
            borderLeft: `2px solid ${s.accent}`,
            boxShadow: `inset 1px 0 0 rgba(${s.accentRgb},0.08)`,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              `inset 1px 0 0 rgba(${s.accentRgb},0.2), 0 0 18px rgba(${s.accentRgb},0.12)`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.boxShadow =
              `inset 1px 0 0 rgba(${s.accentRgb},0.08)`;
          }}
        >
          {/* Header strip */}
          <div className="flex items-center justify-between px-3.5 pt-3 pb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[9px] font-black tracking-[0.2em] uppercase"
                style={{ color: s.accent }}
              >
                {s.code}
              </span>
              <span className="text-[8px] text-slate-600 tracking-widest uppercase">
                {s.channel}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${s.statusDot}`} />
              <span className="text-[8px] tracking-widest" style={{ color: s.accent }}>
                {s.statusText}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-3.5 h-px bg-[#1e1e2e]" />

          {/* Main body */}
          <div className="px-3.5 py-3 flex-1 space-y-1">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest">{s.title}</p>
            <div
              className="text-3xl font-orbitron font-black tracking-tight leading-none"
              style={{
                color: s.accent,
                textShadow: `0 0 16px rgba(${s.accentRgb},0.55)`,
              }}
            >
              {s.value}
            </div>
          </div>

          {/* Sparkline bars */}
          <div className="px-3.5 pb-2 flex items-end gap-0.5 h-7">
            {s.bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-[1px] transition-all duration-300"
                style={{
                  height: `${(h / 12) * 100}%`,
                  background: `rgba(${s.accentRgb},${0.25 + (h / 12) * 0.55})`,
                }}
              />
            ))}
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between px-3.5 py-2 border-t"
            style={{ borderColor: `rgba(${s.accentRgb},0.15)`, background: `rgba(${s.accentRgb},0.04)` }}
          >
            <span className="text-[8px] text-slate-600 uppercase tracking-wider">{s.subLabel}:</span>
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: s.accent }}
            >
              {s.sub}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
