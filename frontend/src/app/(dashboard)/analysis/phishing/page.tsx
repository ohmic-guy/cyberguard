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
import { MailWarning, Globe, MessageSquare, QrCode, ArrowRight, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function PhishingAnalysisPage() {
  const router = useRouter();
  const [activeModality, setActiveModality] = useState<InputModality>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyzedResult, setAnalyzedResult] = useState<ThreatEvent | null>(null);

  // Form states
  const [emailSender, setEmailSender] = useState('billing-notice@paypal-support-sec.com');
  const [emailSubject, setEmailSubject] = useState('URGENT: Suspicious unauthorized withdrawal of $950.00');
  const [emailBody, setEmailBody] = useState('Dear valued user, an unauthorized withdrawal was initiated from IP 185.220.101.4. If you did not authorize this, click here immediately to cancel and preserve your funds: http://paypal-dispute-cancellation-portal.cc/auth');

  const [urlString, setUrlString] = useState('https://login-okta-auth-verify.com/token/sso');
  const [smsText, setSmsText] = useState('IRS Urgent: Your tax refund #TX-9901 is on hold due to missing SSN verification. Update now at http://bit.ly/irs-gov-refund');
  const [qrUrl, setQrUrl] = useState('https://park-chicago-meter-pay.org/auth/card-submit');

  const modalityTabs = [
    { id: 'email', label: 'Email Phishing', icon: <MailWarning className="h-4 w-4" /> },
    { id: 'url', label: 'Malicious URL / Domain', icon: <Globe className="h-4 w-4" /> },
    { id: 'sms', label: 'Smishing / SMS', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'qr', label: 'Quishing / QR Code', icon: <QrCode className="h-4 w-4" /> },
  ];

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAnalyzedResult(null);

    let payload: Record<string, any> = {};
    if (activeModality === 'email') {
      payload = { sender: emailSender, subject: emailSubject, body: emailBody };
    } else if (activeModality === 'url') {
      payload = { target_url: urlString, ssl_valid: false };
    } else if (activeModality === 'sms') {
      payload = { sms_body: smsText, origin_shortcode: '90124' };
    } else if (activeModality === 'qr') {
      payload = { decoded_uri: qrUrl, physical_context: 'Public street poster' };
    }

    try {
      const result = await api.submitAnalysis(
        'phishing',
        activeModality,
        `Analyst_Scanner_${activeModality.toUpperCase()}`,
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
          <MailWarning className="h-6 w-6 text-purple-400" />
          <span>Phishing & Deceptive Messaging Analyzer</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Heuristic NLP and domain reputation scanner for spearphishing emails, reverse-proxy URLs, smishing SMS, and quishing QR codes.
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
        {/* Input Form Column */}
        <div className="lg:col-span-7">
          <Card className="border-slate-800 bg-black/80 p-5">
            <CardHeader className="p-0 pb-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold text-white font-mono flex items-center justify-between">
                <span>Inspect {activeModality.toUpperCase()} Artifact</span>
                <span className="text-[10px] text-cyan-400 uppercase">AgentScope Phishing Agent</span>
              </CardTitle>
              <CardDescription>
                Provide headers, URLs, or message bodies for autonomous agent consensus scoring.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleRunAnalysis} className="pt-4 space-y-4">
              {activeModality === 'email' && (
                <>
                  <Input
                    label="Sender Address (From:)"
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    required
                  />
                  <Input
                    label="Subject Header"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                  />
                  <Textarea
                    label="Email Body Content / Raw HTML"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    required
                  />
                </>
              )}

              {activeModality === 'url' && (
                <Input
                  label="Target Domain or URL"
                  value={urlString}
                  onChange={(e) => setUrlString(e.target.value)}
                  placeholder="https://..."
                  required
                />
              )}

              {activeModality === 'sms' && (
                <Textarea
                  label="SMS Message Body"
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  rows={4}
                  required
                />
              )}

              {activeModality === 'qr' && (
                <Input
                  label="QR Code Decoded URL Target"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              )}

              <Button
                type="submit"
                variant="cyber"
                className="w-full justify-center text-xs h-10 gap-2"
                isLoading={isSubmitting}
              >
                <Sparkles className="h-4 w-4" />
                <span>Execute Phishing Agent Scorer</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Real-time Analysis Output Column */}
        <div className="lg:col-span-5">
          {analyzedResult ? (
            <Card className="border-purple-500/40 bg-black/90 p-5 shadow-[0_0_20px_rgba(168,85,247,0.15)] space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Agent Scoring Complete</span>
                </span>
                <Badge risk={analyzedResult.risk_level || 'high'} variant="risk" size="sm" />
              </div>

              <div className="flex items-center justify-center p-3 bg-black/70 rounded-xl border border-slate-800">
                <ConfidenceGauge
                  confidence={analyzedResult.confidence || 0.9}
                  size={100}
                  strokeWidth={9}
                  label="Phishing Probability"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Agent Assessment</span>
                <p className="text-slate-200 font-sans leading-relaxed">{analyzedResult.explanation}</p>
              </div>

              {analyzedResult.indicators?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Indicators Found</span>
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
                className="w-full justify-center text-xs gap-1.5 border-purple-500/40 text-purple-300 hover:bg-purple-950/30"
              >
                <span>Open Incident in SOC Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Card>
          ) : (
            <Card className="border-slate-800 bg-black/40 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-12 w-12 rounded-full bg-black/80 border border-slate-700 flex items-center justify-center mb-3">
                <MailWarning className="h-6 w-6 text-purple-400" />
              </div>
              <h4 className="text-sm font-bold text-white font-mono">Awaiting Input</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs font-sans">
                Submit an email, domain, or message payload to trigger the multi-agent detection pipeline.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
