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
    name: 'Dashboard',
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
    name: 'MITRE ATT&CK',
    href: '/mitre',
    icon: Grid3X3,
  },
  {
    name: 'Settings',
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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-60 flex-col bg-[#0d0f14] border-r border-[#21262d] transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-[#21262d]">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#58a6ff]/10 border border-[#58a6ff]/20 text-[#58a6ff]">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#e6edf3] tracking-tight">
              CyberGuard
            </span>
            <span className="text-[10px] text-[#6e7681] font-medium">
              SOC Platform
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          <p className="px-3 pb-2 text-[10px] font-medium text-[#6e7681] uppercase tracking-wider">
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors duration-150 group cursor-pointer select-none',
                  isActive
                    ? 'bg-[#58a6ff]/10 text-[#58a6ff]'
                    : 'text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0',
                      isActive ? 'text-[#58a6ff]' : 'text-[#6e7681] group-hover:text-[#8b949e]'
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded-full bg-[#3fb950]/15 border border-[#3fb950]/25 px-1.5 py-0.5 text-[9px] font-semibold text-[#3fb950] uppercase tracking-wide">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Status Footer */}
        <div className="p-3 border-t border-[#21262d]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-md bg-[#161b22]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3fb950] opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3fb950]" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#c9d1d9] truncate">
                Agent Ingestion
              </span>
              <span className="text-[10px] text-[#6e7681]">
                Redis stream synced
              </span>
            </div>
            <Radio className="h-3.5 w-3.5 text-[#3fb950] flex-shrink-0 ml-auto animate-pulse" />
          </div>
        </div>
      </aside>
    </>
  );
}

