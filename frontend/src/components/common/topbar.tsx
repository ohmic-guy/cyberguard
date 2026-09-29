'use client';

import React from 'react';
import { Menu, Search, Radio, Bell, User, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile hamburger & title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-slate-500">CLUSTER:</span>
          <span className="text-slate-200 font-semibold">CYBERGUARD-PROD-EAST</span>
          <span className="text-slate-700">|</span>
          <span className="text-slate-500">AGENT SCOPE:</span>
          <span className="text-cyan-400 font-semibold">1.0.21</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs font-mono">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
            }`}
          />
          <span className="text-slate-300 hidden md:inline">
            {isConnected ? 'LIVE WEBSOCKET' : 'DEMO STREAM SIMULATOR'}
          </span>
        </div>

        {/* Trigger Test Ingestion Button */}
        {onSimulateEvent && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateEvent}
            className="hidden sm:inline-flex border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 gap-1.5 font-mono text-xs"
            title="Inject simulated live threat into pipeline"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            Simulate Event
          </Button>
        )}

        {/* Critical Threat Alert Indicator */}
        <div className="relative">
          <div className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            {criticalCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]">
                {criticalCount}
              </span>
            )}
          </div>
        </div>

        {/* User / Analyst Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold font-mono text-slate-200">admin</span>
            <span className="text-[10px] text-slate-400 font-mono">SOC Level 3</span>
          </div>
        </div>
      </div>
    </header>
  );
}
