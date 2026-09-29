import React from 'react';
import { DashboardMetrics } from '@/types/threat';
import { ShieldAlert, AlertTriangle, Sparkles, Database } from 'lucide-react';

interface ThreatOverviewProps {
  metrics: DashboardMetrics | null;
}

export function ThreatOverview({ metrics }: ThreatOverviewProps) {
  const stats = [
    {
      title: 'TOTAL SCANNED EVENTS',
      value: metrics?.total_events.toLocaleString() || '14,820',
      change: '+340 / MIN',
      icon: Database,
      textColor: 'text-[#00ff88]',
      borderColor: 'border-[#00ff88]/40 hover:border-[#00ff88]',
      glowColor: 'hover:shadow-[0_0_20px_rgba(0,255,136,0.35)]',
      iconBg: 'bg-[#00ff88]/15 border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_10px_rgba(0,255,136,0.3)]',
      code: 'SYS-01',
    },
    {
      title: 'CRITICAL THREAT INCIDENTS',
      value: metrics?.critical_threats || '18',
      change: 'ACTION REQUIRED',
      icon: ShieldAlert,
      textColor: 'text-[#ff3366]',
      borderColor: 'border-[#ff3366]/50 hover:border-[#ff3366]',
      glowColor: 'shadow-[0_0_15px_rgba(255,51,102,0.2)] hover:shadow-[0_0_25px_rgba(255,51,102,0.45)]',
      iconBg: 'bg-[#ff3366]/20 border-[#ff3366]/60 text-[#ff3366] shadow-[0_0_12px_rgba(255,51,102,0.4)]',
      code: 'SEC-04',
    },
    {
      title: 'HIGH PRIORITY ALERTS',
      value: metrics?.high_threats || '47',
      change: 'ESCALATED L2 SOC',
      icon: AlertTriangle,
      textColor: 'text-[#ff8800]',
      borderColor: 'border-[#ff8800]/40 hover:border-[#ff8800]',
      glowColor: 'hover:shadow-[0_0_20px_rgba(255,136,0,0.35)]',
      iconBg: 'bg-[#ff8800]/15 border-[#ff8800]/50 text-[#ff8800]',
      code: 'ALR-02',
    },
    {
      title: 'AVG AI CONFIDENCE',
      value: `${Math.round((metrics?.avg_confidence || 0.91) * 100)}%`,
      change: 'NEURAL CONSENSUS',
      icon: Sparkles,
      textColor: 'text-[#ff00ff]',
      borderColor: 'border-[#ff00ff]/40 hover:border-[#ff00ff]',
      glowColor: 'hover:shadow-[0_0_20px_rgba(255,0,255,0.35)]',
      iconBg: 'bg-[#ff00ff]/15 border-[#ff00ff]/50 text-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.3)]',
      code: 'AI-CORE',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`cyber-chamfer holographic-bracket relative bg-[#12121a] border ${stat.borderColor} p-5 transition-all duration-300 ${stat.glowColor}`}
          >
            {/* Top metadata tag */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2">
              <span className="font-bold tracking-widest">{stat.code}</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-600">HUD TELEMETRY</span>
            </div>

            <div className="flex items-start justify-between mt-1">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  {stat.title}
                </span>
                <div className={`text-3xl font-orbitron font-black tracking-tight ${stat.textColor} drop-shadow-[0_0_8px_currentColor]`}>
                  {stat.value}
                </div>
              </div>
              <div className={`cyber-chamfer-sm p-2.5 border ${stat.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-[#2a2a3a] flex items-center justify-between text-[10px] tracking-wider uppercase">
              <span className="text-slate-500">STATUS:</span>
              <span className={`font-bold ${stat.textColor}`}>{stat.change}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

