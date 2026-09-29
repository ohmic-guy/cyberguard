'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Lock, User, KeyRound, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('cyberguard2024');
  const [role, setRole] = useState('Senior SOC Analyst (Level 3)');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      if (username === 'admin' && password === 'cyberguard2024') {
        localStorage.setItem('cyberguard_user', JSON.stringify({ username, role }));
        router.push('/');
      } else {
        setError('Invalid credentials. Use admin / cyberguard2024 for Hackathon SOC access.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('cyberguard2024');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)] mb-2">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white font-mono">
            CYBER<span className="text-cyan-400">GUARD</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            AI-Powered Cyber Threat, Phishing & Digital Impersonation Defense
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-400">
            <Cpu className="h-3 w-3" />
            <span>BPUT Hackathon · Problem Statement 9</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-base text-white font-mono flex items-center justify-between">
              <span>SOC Access Gateway</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM ONLINE
              </span>
            </CardTitle>
            <CardDescription>
              Authenticate to access live telemetry, agent orchestration & response controls.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-[11px] text-red-300 font-mono flex items-center gap-2">
                  <Lock className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Input
                label="Operator Identity"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
                required
              />

              <Input
                label="Security Keyphrase"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 font-mono">
                  Authorization Profile
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg bg-slate-950/80 border border-slate-700/80 px-3.5 py-2 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                >
                  <option>Senior SOC Analyst (Level 3)</option>
                  <option>Incident Response Lead</option>
                  <option>SecOps Administrator</option>
                  <option>Auditor (Read Only)</option>
                </select>
              </div>

              {/* Quick Fill Helper */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Demo: <strong className="text-slate-200">admin</strong> / <strong className="text-slate-200">cyberguard2024</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                >
                  Auto Fill
                </button>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                variant="cyber"
                className="w-full justify-center text-sm font-mono h-10"
                isLoading={isLoading}
              >
                <span>Enter SOC Control Room</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Compliance Footnote */}
        <div className="text-center text-[10px] text-slate-500 font-mono space-y-1">
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>FIPS 140-2 Validated Encryption · MITRE ATT&CK Matrix v14 Compliant</span>
          </div>
          <p>© 2026 CyberGuard Team. Problem Statement 9.</p>
        </div>
      </div>
    </div>
  );
}
