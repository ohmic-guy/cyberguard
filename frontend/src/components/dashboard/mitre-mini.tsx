import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { COMMON_MITRE_TECHNIQUES } from '@/lib/constants';
import { Grid3X3, ChevronRight } from 'lucide-react';

export function MitreMini() {
  return (
    <Card variant="terminal" terminalTitle="TACTICAL_MATRIX // MITRE_ATT&CK" className="p-5 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-[#2a2a3a]">
        <div>
          <h4 className="text-sm font-orbitron font-bold text-white uppercase flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-[#00d4ff]" />
            <span>Active MITRE ATT&CK Mapping</span>
          </h4>
          <p className="text-xs text-slate-400 font-mono">Adversary tactics correlated across observed incident stream</p>
        </div>
        <Link
          href="/mitre"
          className="cyber-chamfer-sm text-xs font-mono text-[#00d4ff] hover:bg-[#00d4ff] hover:text-[#0a0a0f] border border-[#00d4ff]/40 px-3 py-1 flex items-center gap-1 font-bold uppercase tracking-wider transition-all duration-150 shadow-[0_0_8px_rgba(0,212,255,0.2)]"
        >
          <span>FULL MATRIX</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {COMMON_MITRE_TECHNIQUES.slice(0, 6).map((tech) => (
          <div
            key={tech.id}
            className="cyber-chamfer-sm p-3 bg-[#12121a] border border-[#2a2a3a] hover:border-[#00d4ff]/60 hover:shadow-[0_0_12px_rgba(0,212,255,0.2)] transition-all font-mono space-y-2 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="cyber-chamfer-sm text-xs font-bold text-[#00d4ff] bg-[#00d4ff]/15 border border-[#00d4ff]/40 px-1.5 py-0.5">
                {tech.id}
              </span>
              <span className="text-[10px] text-[#00ff88] font-bold tracking-wider uppercase">
                {tech.detectedCount} HITS
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate uppercase tracking-tight">{tech.name}</p>
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">
              TAC: {tech.tactic}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

