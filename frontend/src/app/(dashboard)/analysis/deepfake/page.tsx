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
import { FileUpload } from '@/components/ui/file-upload';
import { Eye, Mic, Video, Image as ImageIcon, Sparkles, CheckCircle2, ArrowRight, AudioWaveform as WaveformIcon, Activity } from 'lucide-react';

export default function DeepfakeAnalysisPage() {
  const router = useRouter();
  const [activeModality, setActiveModality] = useState<InputModality>('audio');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<ThreatEvent | null>(null);

  // Form states
  const [file, setFile] = useState<File | null>(null);

  const modalityTabs = [
    { id: 'audio', label: 'Synthetic Audio / Voice Clone', icon: <Mic className="h-4 w-4" /> },
    { id: 'video', label: 'Video Deepfake / Face Swap', icon: <Video className="h-4 w-4" /> },
    { id: 'image', label: 'Synthesized Biometric Image', icon: <ImageIcon className="h-4 w-4" /> },
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setIsSubmitting(true);
    setAnalyzedResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('modality', activeModality);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      
      if (data.event_id) {
        let attempts = 0;
        let finalResult = null;
        while (attempts < 15) {
          await new Promise(r => setTimeout(r, 1000));
          const threatRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/threats/${data.event_id}`);
          if (threatRes.ok) {
            const threatData = await threatRes.json();
            if (threatData.status === 'complete') {
              finalResult = threatData;
              break;
            }
          }
          attempts++;
        }
        if (finalResult) {
          setAnalyzedResult(finalResult);
        }
      }
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
          <Card className="border-slate-800 bg-black/80 p-5">
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
              <FileUpload onFileSelect={setFile} />

              <Button
                type="submit"
                variant="cyber"
                className="w-full justify-center text-xs h-10 gap-2"
                isLoading={isSubmitting}
                disabled={!file}
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
            <Card className="border-pink-500/40 bg-black/90 p-5 shadow-[0_0_20px_rgba(236,72,153,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Biometric Scoring Concluded</span>
                </span>
                <Badge risk={analyzedResult.risk_level || 'critical'} variant="risk" size="sm" />
              </div>

              <div className="flex items-center justify-center p-3 bg-black/70 rounded-xl border border-slate-800">
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
                    <div key={i} className="p-2 rounded bg-black border border-slate-800 text-[11px] text-slate-300">
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
            <Card className="border-slate-800 bg-black/40 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-black/80 border border-slate-700 flex items-center justify-center mb-3">
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
