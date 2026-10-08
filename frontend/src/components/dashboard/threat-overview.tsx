import React from 'react';
import { DashboardMetrics } from '@/types/threat';

interface ThreatOverviewProps {
  metrics: DashboardMetrics | null;
}

export function ThreatOverview({ metrics: m }: ThreatOverviewProps) {
  const stats = [
    {
      label: 'Total Events',
      value: m?.total_events?.toLocaleString() ?? '14,822',
      sub: '+340 / min',
      color: 'text-[#58a6ff]',
      dot: 'bg-[#58a6ff]',
    },
    {
      label: 'Critical Threats',
      value: String(m?.critical_threats ?? 3),
      sub: 'Action required',
      color: 'text-[#f85149]',
      dot: 'bg-[#f85149]',
    },
    {
      label: 'High Priority',
      value: String(m?.high_threats ?? 3),
      sub: 'Escalated L2',
      color: 'text-[#d29922]',
      dot: 'bg-[#d29922]',
    },
    {
      label: 'AI Confidence',
      value: `${Math.round((m?.avg_confidence ?? 0.91) * 100)}%`,
      sub: 'Neural consensus',
      color: 'text-[#3fb950]',
      dot: 'bg-[#3fb950]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg bg-[#161b22] border border-[#21262d] p-4 hover:border-[#30363d] transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[#6e7681]">{s.label}</span>
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
          </div>
          <div className={`text-2xl font-semibold ${s.color} mb-1`}>{s.value}</div>
          <div className="text-xs text-[#6e7681]">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
