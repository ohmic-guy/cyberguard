import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { COMMON_MITRE_TECHNIQUES } from '@/lib/constants';
import { Grid3X3, ExternalLink, ChevronRight } from 'lucide-react';

export function MitreMini() {
  return (
    <Card className="border-slate-800 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
            <Grid3X3 className="h-4 w-4 text-cyan-400" />
            <span>Active MITRE ATT&CK Mapping</span>
          </h4>
          <p className="text-xs text-slate-400">Adversary tactics correlated across observed incident stream</p>
        </div>
        <Link
          href="/mitre"
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
        >
          <span>Full Matrix</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {COMMON_MITRE_TECHNIQUES.slice(0, 6).map((tech) => (
          <div
            key={tech.id}
            className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/40 transition-colors font-mono space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                {tech.id}
              </span>
              <span className="text-[10px] text-slate-400">{tech.detectedCount} hits</span>
            </div>
            <p className="text-xs font-semibold text-white truncate">{tech.name}</p>
            <span className="text-[10px] text-slate-500 block uppercase">{tech.tactic}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
