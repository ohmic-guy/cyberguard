'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Sliders, Server, Radio, Database, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000/api/v1');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8000/api/v1/ws');
  const [criticalThreshold, setCriticalThreshold] = useState('0.85');
  const [highThreshold, setHighThreshold] = useState('0.65');
  const [healthStatus, setHealthStatus] = useState<{ status: string; service: string } | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    handleCheckHealth();
  }, []);

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await api.checkHealth();
      setHealthStatus(res);
    } catch (err) {
      setHealthStatus({ status: 'offline', service: 'FastAPI Backend Offline' });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sliders className="h-6 w-6 text-cyan-400" />
          <span>SOC Engine & Telemetry Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Manage FastAPI service endpoints, WebSocket streaming channels, and agent scoring sensitivity.
        </p>
      </div>

      {/* Health Status Card */}
      <Card className="border-slate-800 bg-black/80 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">FastAPI Backend Status</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-transparent border ${
                    healthStatus?.status === 'ok'
                      ? 'text-emerald-400 border-emerald-500/40'
                      : 'text-amber-400 border-amber-500/40'
                  }`}
                >
                  {healthStatus?.status || 'CHECKING'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{healthStatus?.service || 'Connecting...'}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCheckHealth}
            isLoading={isCheckingHealth}
            className="text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Check Connection
          </Button>
        </div>
      </Card>

      {/* Form Card */}
      <form onSubmit={handleSave}>
        <Card className="border-slate-800 bg-black/80 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              <span>Service Endpoint Endpoints</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="FastAPI REST API Base URL"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api/v1"
              />
              <Input
                label="FastAPI WebSocket Ingress URL"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8000/api/v1/ws"
              />
            </div>
          </div>

          {/* Redis Stream Channels Overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-400" />
              <span>Redis Stream Subscriptions (Streams.py)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { name: 'cyberguard:raw.input', desc: 'Raw ingestion pipeline' },
                { name: 'cyberguard:phishing.input', desc: 'Email/URL/SMS stream' },
                { name: 'cyberguard:deepfake.input', desc: 'Audio/Video/Image media' },
                { name: 'cyberguard:log.input', desc: 'Auth & system syslog events' },
                { name: 'cyberguard:threat.detected', desc: 'Pre-scoring detection' },
                { name: 'cyberguard:threat.escalated', desc: 'Critical alert broadcast' },
              ].map((stream) => (
                <div
                  key={stream.name}
                  className="p-2.5 rounded-lg bg-black/70 border border-slate-800 flex items-center justify-between"
                >
                  <span className="text-cyan-400 font-bold">{stream.name}</span>
                  <span className="text-[10px] text-slate-400">{stream.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Threshold Tuning */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Multi-Agent Consensus Thresholds</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Critical Risk Trigger Threshold (0.0 - 1.0)"
                type="number"
                step="0.05"
                min="0.5"
                max="1.0"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(e.target.value)}
              />
              <Input
                label="High Risk Trigger Threshold (0.0 - 1.0)"
                type="number"
                step="0.05"
                min="0.3"
                max="0.9"
                value={highThreshold}
                onChange={(e) => setHighThreshold(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Settings updated successfully
              </span>
            )}
            <div className="ml-auto">
              <Button type="submit" variant="cyber" size="sm">
                Apply Configuration
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
