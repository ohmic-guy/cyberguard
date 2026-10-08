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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#2a2a3a] bg-[#0a0a0f]/90 px-4 sm:px-6 backdrop-blur-md font-mono">
      {/* Left: Mobile hamburger & Cluster telemetry */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="cyber-chamfer-sm p-2 text-slate-400 hover:bg-[#1c1c2e] hover:text-[#00ff88] border border-[#2a2a3a] lg:hidden cursor-pointer"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2.5 text-xs font-mono">
          <span className="text-slate-500 font-bold">&gt; CLUSTER:</span>
          <span className="cyber-chamfer-sm bg-[#12121a] border border-[#2a2a3a] px-2 py-0.5 text-slate-200 font-semibold tracking-wider">
            CYBERGUARD-PROD-EAST
          </span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500 font-bold">AGENT SCOPE:</span>
          <span className="text-[#00d4ff] font-bold tracking-wider">1.0.21-CYBER</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time Connection Indicator */}
        <div className="cyber-chamfer-sm flex items-center gap-2 border border-[#2a2a3a] bg-[#12121a] px-3 py-1 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected
                ? 'bg-[#00ff88] shadow-[0_0_8px_#00ff88] animate-pulse'
                : 'bg-[#ffb800] shadow-[0_0_8px_#ffb800]'
            }`}
          />
          <span className="text-slate-300 hidden md:inline font-bold tracking-wider uppercase text-[11px]">
            {isConnected ? 'LIVE WEBSOCKET' : 'DEMO STREAM SIMULATOR'}
          </span>
        </div>

        {/* Trigger Test Ingestion Button */}
        {onSimulateEvent && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateEvent}
            className="hidden sm:inline-flex border-[#00d4ff]/40 text-[#00d4ff] hover:border-[#00d4ff] hover:text-[#0a0a0f] hover:bg-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] gap-1.5 font-mono text-xs"
            title="Inject simulated live threat into pipeline"
          >
            <Zap className="h-3.5 w-3.5" />
            Simulate Event
          </Button>
        )}

        {/* Critical Threat Alert Indicator */}
        <div className="relative">
          <div className="cyber-chamfer-sm p-2 text-slate-400 hover:bg-[#12121a] hover:text-[#ff3366] border border-[#2a2a3a] hover:border-[#ff3366]/40 transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-[#ff3366] text-[9px] font-black text-white shadow-[0_0_10px_rgba(255,51,102,0.9)] animate-pulse">
                {criticalCount}
              </span>
            )}
          </div>
        </div>

        {/* User / Analyst Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#2a2a3a]">
          <div className="cyber-chamfer-sm flex h-8 w-8 items-center justify-center bg-[#12121a] border border-[#00ff88]/40 text-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.2)]">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">admin</span>
            <span className="text-[9px] text-[#00ff88] font-mono uppercase tracking-widest">SOC Level 3</span>
          </div>
        </div>
      </div>
    </header>
  );
}

