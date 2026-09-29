import React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-2 border-b border-[#2a2a3a] pb-1.5 overflow-x-auto', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'cyber-chamfer-sm flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap cursor-pointer select-none',
              isActive
                ? 'bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/60 shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1c1c2e]/60 border border-transparent'
            )}
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'cyber-chamfer-sm px-1.5 py-0.2 text-[10px] font-mono',
                  isActive ? 'bg-[#00ff88]/25 text-[#00ff88]' : 'bg-[#1c1c2e] text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

