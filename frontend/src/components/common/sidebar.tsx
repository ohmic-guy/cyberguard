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
          className="fixed inset-0 z-40 bg-black/85 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col bg-[#0a0a0f] border-r border-[#2a2a3a] transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-[#2a2a3a] bg-[#12121a]/95">
          <div className="cyber-chamfer-sm flex h-9 w-9 items-center justify-center bg-[#00ff88]/15 border border-[#00ff88]/50 text-[#00ff88] shadow-[0_0_12px_rgba(0,255,136,0.35)]">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-orbitron font-black tracking-widest text-white flex items-center gap-1">
              CYBER<span className="text-[#00ff88]">GUARD</span>
            </span>
            <span className="text-[9px] text-[#00d4ff] font-mono tracking-widest uppercase font-semibold">
              {'SOC // DYSTOPIA DEFENSE'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>&gt; COMMAND & CONTROL</span>
            <span className="h-1 w-1 bg-[#00ff88] rounded-full animate-ping" />
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
                  'cyber-chamfer-sm flex items-center justify-between px-3 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-150 group cursor-pointer select-none',
                  isActive
                    ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/60 shadow-[0_0_14px_rgba(0,255,136,0.25)]'
                    : 'text-slate-400 hover:bg-[#12121a] hover:text-[#e0e0e0] border border-transparent hover:border-[#2a2a3a]'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-[#00ff88] filter drop-shadow-[0_0_4px_#00ff88]' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="cyber-chamfer-sm bg-[#ff00ff]/20 border border-[#ff00ff]/50 px-1.5 py-0.5 text-[9px] font-bold text-[#ff00ff] uppercase tracking-wider shadow-[0_0_8px_rgba(255,0,255,0.3)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Real-time Stream Status Footer */}
        <div className="p-3 border-t border-[#2a2a3a] bg-[#0a0a0f]">
          <div className="cyber-chamfer-sm flex items-center justify-between bg-[#12121a] border border-[#2a2a3a] p-3 hover:border-[#00ff88]/40 transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff88] shadow-[0_0_6px_#00ff88]"></span>
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-200 font-mono tracking-wider uppercase">
                  AGENT INGESTION
                </span>
                <span className="text-[9px] text-[#00ff88] font-mono tracking-widest">
                  {'REDIS STREAM // SYNCED'}
                </span>
              </div>
            </div>
            <Radio className="h-4 w-4 text-[#00ff88] animate-pulse filter drop-shadow-[0_0_4px_#00ff88]" />
          </div>
        </div>
      </aside>
    </>
  );
}

