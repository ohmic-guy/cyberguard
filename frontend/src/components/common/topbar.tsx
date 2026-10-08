'use client';

import React from 'react';
import { Menu, Bell, User, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onToggleSidebar: () => void;
  isConnected: boolean;
  onSimulateEvent?: () => void;
  criticalCount?: number;
}

export function Topbar({
  onToggleSidebar,
  isConnected,
  onSimulateEvent,
  criticalCount = 2,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#21262d] bg-[#0d0f14]/95 px-4 sm:px-5 backdrop-blur-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md text-[#6e7681] hover:bg-[#161b22] hover:text-[#c9d1d9] transition-colors lg:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#6e7681]">
          <span className="font-medium text-[#8b949e]">Cluster:</span>
          <span className="font-mono text-[#c9d1d9]">cyberguard-prod</span>
          <span className="text-[#30363d]">·</span>
          <span className="font-mono text-[#58a6ff]">v1.0.21</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#21262d] text-xs">
          <span
            className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
              isConnected ? 'bg-[#3fb950]' : 'bg-[#d29922]'
            }`}
          />
          <span className="text-[#8b949e] hidden md:inline">
            {isConnected ? 'Live' : 'Demo'}
          </span>
        </div>

        {onSimulateEvent && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateEvent}
            className="hidden sm:inline-flex gap-1.5 text-xs"
            title="Inject simulated live threat"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate
          </Button>
        )}

        <div className="relative">
          <button className="p-1.5 rounded-md text-[#6e7681] hover:bg-[#161b22] hover:text-[#c9d1d9] transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f85149] text-[8px] font-bold text-white">
                {criticalCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-[#21262d]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#161b22] border border-[#30363d] text-[#8b949e]">
            <User className="h-3.5 w-3.5" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-[#c9d1d9]">admin</span>
            <span className="text-[10px] text-[#6e7681]">SOC Level 3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
