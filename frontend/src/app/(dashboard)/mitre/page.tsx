'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { COMMON_MITRE_TECHNIQUES } from '@/lib/constants';
import { Grid3X3, Search, ExternalLink, ShieldAlert, ArrowRight } from 'lucide-react';

export default function MitreMatrixPage() {
  const [search, setSearch] = useState('');

  const tactics = [
    {
      name: 'Initial Access',
      description: 'Techniques that use various entry vectors to gain an initial foothold.',
      techniques: [
        { id: 'T1566.001', name: 'Spearphishing Attachment', hits: 42, severity: 'critical' },
        { id: 'T1566.002', name: 'Spearphishing Link', hits: 68, severity: 'critical' },
        { id: 'T1190', name: 'Exploit Public-Facing App', hits: 11, severity: 'high' },
        { id: 'T1204', name: 'User Execution (Quishing)', hits: 23, severity: 'high' },
      ],
    },
    {
      name: 'Execution',
      description: 'Techniques that result in adversary-controlled code running on a local or remote system.',
      techniques: [
        { id: 'T1059.006', name: 'Python Interpreter Abuse', hits: 9, severity: 'medium' },
        { id: 'T1059.001', name: 'PowerShell Execution', hits: 17, severity: 'high' },
        { id: 'T1203', name: 'Exploitation for Client Execution', hits: 5, severity: 'low' },
      ],
    },
    {
      name: 'Credential Access',
      description: 'Techniques for stealing credentials like account names and passwords.',
      techniques: [
        { id: 'T1110.003', name: 'Password Spraying', hits: 29, severity: 'high' },
        { id: 'T1556', name: 'Modify Authentication Process (Reverse Proxy)', hits: 31, severity: 'critical' },
        { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', hits: 14, severity: 'high' },
      ],
    },
    {
      name: 'Defense Evasion',
      description: 'Techniques that adversaries use to avoid detection throughout their compromise.',
      techniques: [
        { id: 'T1656', name: 'Impersonation: Synthetic Audio & Video', hits: 19, severity: 'critical' },
        { id: 'T1070', name: 'Indicator Removal on Host', hits: 8, severity: 'medium' },
        { id: 'T1562', name: 'Impair Defenses (Bypass Rate Limiter)', hits: 12, severity: 'medium' },
      ],
    },
    {
      name: 'Command & Control',
      description: 'Techniques that adversaries may use to communicate with systems under their control.',
      techniques: [
        { id: 'T1071.001', name: 'Web Protocols (HTTP/S C2)', hits: 51, severity: 'medium' },
        { id: 'T1105', name: 'Ingress Tool Transfer', hits: 16, severity: 'high' },
      ],
    },
  ];

  const filteredTactics = tactics.map((tactic) => ({
    ...tactic,
    techniques: tactic.techniques.filter(
      (tech) =>
        tech.id.toLowerCase().includes(search.toLowerCase()) ||
        tech.name.toLowerCase().includes(search.toLowerCase()) ||
        tactic.name.toLowerCase().includes(search.toLowerCase())
    ),
  }));

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-cyan-400" />
            <span>MITRE ATT&CK Matrix Heatmap</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Enterprise matrix correlation mapping real-time detections directly to adversary Tactics, Techniques & Procedures (TTPs).
          </p>
        </div>

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search technique ID or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Interactive Matrix Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredTactics.map((tactic) => (
          <div key={tactic.name} className="space-y-3">
            {/* Tactic Header */}
            <div className="p-3 rounded-lg bg-black border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 tracking-wide uppercase">
                  {tactic.name}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {tactic.techniques.length} TTPs
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans mt-1 line-clamp-2">
                {tactic.description}
              </p>
            </div>

            {/* Techniques List */}
            <div className="space-y-2">
              {tactic.techniques.map((tech) => (
                <div
                  key={tech.id}
                  className="p-3 rounded-lg bg-black/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {tech.id}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border bg-transparent ${
                        tech.severity === 'critical'
                          ? 'text-red-400 border-red-500/30'
                          : tech.severity === 'high'
                          ? 'text-orange-400 border-orange-500/30'
                          : 'text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {tech.hits} events
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-snug">{tech.name}</p>
                  <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                    <a
                      href={`https://attack.mitre.org/techniques/${tech.id.replace('.', '/')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-cyan-400 flex items-center gap-1 underline"
                    >
                      <span>MITRE Docs</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                    <Link
                      href={`/threats?search=${tech.id}`}
                      className="hover:text-slate-300 flex items-center gap-0.5"
                    >
                      <span>Filter</span>
                      <ArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
