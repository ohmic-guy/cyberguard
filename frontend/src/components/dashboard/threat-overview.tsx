import React from 'react';
import { DashboardMetrics } from '@/types/threat';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert, AlertTriangle, Activity, Cpu, Sparkles, Database } from 'lucide-react';

interface ThreatOverviewProps {
  metrics: DashboardMetrics | null;
}

export function ThreatOverview({ metrics }: ThreatOverviewProps) {
  const stats = [
    {
      title: 'Total Scanned Events',
      value: metrics?.total_events.toLocaleString() || '14,820',
      change: '+340/min',
      icon: Database,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-500/30',
    },
    {
      title: 'Critical Threat Incidents',
      value: metrics?.critical_threats || '18',
      change: 'Immediate Action Required',
      icon: ShieldAlert,
      color: 'text-red-400',
      bg: 'bg-red-950/40 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    },
    {
      title: 'High Priority Alerts',
      value: metrics?.high_threats || '47',
      change: 'Escalated to L2 SOC',
      icon: AlertTriangle,
      color: 'text-orange-400',
      bg: 'bg-orange-950/40 border-orange-500/30',
    },
    {
      title: 'Avg AI Confidence',
      value: `${Math.round((metrics?.avg_confidence || 0.91) * 100)}%`,
      change: 'Multi-agent consensus',
      icon: Sparkles,
      color: 'text-purple-400',
      bg: 'bg-purple-950/40 border-purple-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i} className={`p-4 border ${stat.bg} relative overflow-hidden transition-all hover:scale-[1.01]`}>
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className="text-2xl font-black font-mono tracking-tight text-white">{stat.value}</div>
              </div>
              <div className={`p-2.5 rounded-lg border ${stat.bg} ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Status</span>
              <span className={`font-semibold ${stat.color}`}>{stat.change}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
