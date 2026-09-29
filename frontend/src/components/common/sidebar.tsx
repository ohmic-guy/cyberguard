'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  LayoutDashboard,
  AlertOctagon,
  MailWarning,
  Eye,
  FileTerminal,
  Grid3X3,
  Sliders,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  {
    name: 'Dashboard Overview',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Threat Incidents',
    href: '/threats',
    icon: AlertOctagon,
    badge: 'Live',
  },
  {
    name: 'Phishing Detection',
    href: '/analysis/phishing',
    icon: MailWarning,
  },
  {
    name: 'Deepfake Media',
    href: '/analysis/deepfake',
    icon: Eye,
  },
  {
    name: 'Log Anomaly Engine',
    href: '/analysis/log-anomaly',
    icon: FileTerminal,
  },
  {
    name: 'MITRE ATT&CK Matrix',
    href: '/mitre',
    icon: Grid3X3,
  },
  {
    name: 'SOC Settings',
    href: '/settings',
    icon: Sliders,
  },
];

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col bg-slate-950 border-r border-slate-800/80 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-slate-800/80 bg-slate-950/90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-wider text-white font-mono flex items-center gap-1.5">
              CYBER<span className="text-cyan-400">GUARD</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
              SOC v3.0 // AI DEFENSE
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Command & Control
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all group font-mono',
                  isActive
                    ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Real-time Stream Status Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-300 font-mono">Agent Ingestion</span>
                <span className="text-[10px] text-slate-500 font-mono">Redis Streams Active</span>
              </div>
            </div>
            <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}
