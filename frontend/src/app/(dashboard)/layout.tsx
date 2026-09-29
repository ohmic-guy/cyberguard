'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/common/sidebar';
import { Topbar } from '@/components/common/topbar';
import { LiveTicker } from '@/components/common/live-ticker';
import { useWebSocket } from '@/hooks/use-websocket';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isConnected, latestEvent, triggerManualSimulation } = useWebSocket();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <Topbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          isConnected={isConnected}
          onSimulateEvent={triggerManualSimulation}
        />
        <LiveTicker latestEvent={latestEvent} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
