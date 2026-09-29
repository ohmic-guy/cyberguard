'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { InputModality, ThreatEvent } from '@/types/threat';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ConfidenceGauge } from '@/components/ui/progress';
import { Eye, Mic, Video, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight, AudioWaveform as WaveformIcon, Activity } from 'lucide-react';

export default function DeepfakeAnalysisPage() {
  const router = useRouter();
  const [activeModality, setActiveModality] = useState<InputModality>('audio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<ThreatEvent | null>(null);

  // Form states
  const [sourceChannel, setSourceChannel] = useState('VoIP SIP Trunk - Gateway NY-01');
  const [targetIdentity, setTargetIdentity] = useState('Chief Executive Officer (CEO)');
  const [audioTranscript, setAudioTranscript] = useState('This is John. I am calling from the Frankfurt summit. Authorize the urgent security acquisition wire transfer immediately before the banks close.');
  const [fileName, setFileName] = useState('ceo_emergency_call_16khz.wav');

  const modalityTabs = [
    { id: 'audio', label: 'Synthetic Audio / Voice Clone', icon: <Mic className="h-4 w-4" /> },
    { id: 'video', label: 'Video Deepfake / Face Swap', icon: <Video className="h-4 w-4" /> },
    { id: 'image', label: 'Synthesized Biometric Image', icon: <ImageIcon className="h-4 w-4" /> },
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnalyzedResult(null);

    const payload = {
      source_channel: sourceChannel,
      target_identity: targetIdentity,
      transcript: audioTranscript,
      file_name: fileName,
      sample_rate: '16000Hz',
    };

    try {
      const result = await api.submitAnalysis(
        'deepfake',
        activeModality,
        `Deepfake_Sensor_${activeModality.toUpperCase()}`,
        payload
      );
      setAnalyzedResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Eye className="h-6 w-6 text-pink-400" />
          <span>Biometric & Deepfake Media Analyzer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Neural vocoder acoustic analysis, facial landmark micro-jitter detection, and generative artifact scanning.
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={modalityTabs}
        activeTab={activeModality}
        onChange={(id) => {
          setActiveModality(id as InputModality);
          setAnalyzedResult(null);
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-800 bg-slate-900/80 p-5">
            <CardHeader className="p-0 pb-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white font-mono flex items-center justify-between">
                <span>Analyze {activeModality.toUpperCase()} Recording</span>
                <span className="text-[10px] text-pink-400 uppercase">AgentScope Deepfake Agent</span>
              </CardTitle>
              <CardDescription>
                Upload or simulate biometric media samples for acoustic spectral and visual artifact validation.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleRunAnalysis} className="pt-4 space-y-4">
              <Input
                label="Media Asset Name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Ingress Telemetry Source"
                  value={sourceChannel}
                  onChange={(e) => setSourceChannel(e.target.value)}
                  required
                />
                <Input
                  label="Target Person of Interest"
                  value={targetIdentity}
                  onChange={(e) => setTargetIdentity(e.target.value)}
                  required
                />
              </div>

              <Textarea
                label="Audio Transcript / Visual Scene Description"
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                rows={3}
                required
              />

              {/* Simulated Spectral Waveform Visualizer */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-pink-400" />
                    <span>Spectral Waveform Monitor (0 - 8,000 Hz)</span>
                  </span>
                  <span className="text-pink-400">FFT Window: 1024</span>
                </div>
                <div className="flex items-end gap-1 h-12 pt-2 px-1">
                  {Array.from({ length: 40 }).map((_, i) => {
                    const height = Math.min(Math.max((Math.sin(i * 0.4) * 35 + 40), 10), 95);
                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`flex-1 rounded-xs transition-all ${
                          height > 70 ? 'bg-red-500' : height > 45 ? 'bg-pink-500' : 'bg-cyan-500/60'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <Button
                type="submit"
                variant="cyber"
                className="w-full justify-center text-xs h-10 gap-2"
                isLoading={isSubmitting}
              >
                <Sparkles className="h-4 w-4" />
                <span>Execute Deepfake Detector Model</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Real-time Analysis Result Column */}
        <div className="lg:col-span-5">
          {analyzedResult ? (
            <Card className="border-pink-500/40 bg-slate-900/90 p-5 shadow-[0_0_20px_rgba(236,72,153,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Biometric Scoring Concluded</span>
                </span>
                <Badge risk={analyzedResult.risk_level || 'critical'} variant="risk" size="sm" />
              </div>

              <div className="flex items-center justify-center p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                <ConfidenceGauge
                  confidence={analyzedResult.confidence || 0.95}
                  size={100}
                  strokeWidth={9}
                  label="Synthetic Probability"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent Assessment</span>
                <p className="text-slate-200 font-sans leading-relaxed">{analyzedResult.explanation}</p>
              </div>

              {analyzedResult.indicators?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Artifact Indicators</span>
                  {analyzedResult.indicators.map((ind, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      • {ind}
                    </div>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/threats/${analyzedResult.event_id}`)}
                className="w-full justify-center text-xs gap-1.5 border-pink-500/40 text-pink-300 hover:bg-pink-950/30"
              >
                <span>Open Incident in SOC Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-slate-900/40 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-3">
                <Eye className="h-6 w-6 text-pink-400" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono">Awaiting Biometric Sample</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
                Submit an audio sample, video frame, or biometric stream to run neural synthesis verification.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
