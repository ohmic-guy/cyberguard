import { ThreatCategory, InputModality, RiskLevel, EventStatus, MitreTechnique } from '@/types/threat';

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  {
    label: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    glow: string;
    hex: string;
    dotBg: string;
  }
> = {
  critical: {
    label: 'CRITICAL',
    badgeBg: 'bg-red-500/10',
    badgeText: 'text-red-400',
    border: 'border-red-500/40',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.35)]',
    hex: '#EF4444',
    dotBg: 'bg-red-500',
  },
  high: {
    label: 'HIGH',
    badgeBg: 'bg-orange-500/10',
    badgeText: 'text-orange-400',
    border: 'border-orange-500/40',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    hex: '#F97316',
    dotBg: 'bg-orange-500',
  },
  medium: {
    label: 'MEDIUM',
    badgeBg: 'bg-amber-500/10',
    badgeText: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]',
    hex: '#F59E0B',
    dotBg: 'bg-amber-500',
  },
  low: {
    label: 'LOW',
    badgeBg: 'bg-sky-500/10',
    badgeText: 'text-sky-400',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_0_12px_rgba(56,189,248,0.2)]',
    hex: '#38BDF8',
    dotBg: 'bg-sky-500',
  },
  safe: {
    label: 'SAFE',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.2)]',
    hex: '#10B981',
    dotBg: 'bg-emerald-500',
  },
};

export const CATEGORY_CONFIG: Record<
  ThreatCategory,
  {
    label: string;
    description: string;
    color: string;
    border: string;
  }
> = {
  phishing: {
    label: 'Phishing',
    description: 'Deceptive emails, forged URLs, credential harvest SMS, QR phishing',
    color: 'text-purple-400 bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  deepfake: {
    label: 'Deepfake Media',
    description: 'Manipulated biometric media, synthetic voice audio, face swaps',
    color: 'text-pink-400 bg-pink-500/10',
    border: 'border-pink-500/30',
  },
  log_anomaly: {
    label: 'Log Anomaly',
    description: 'Privilege escalation, auth spray, credential stuffing, anomalous sys logs',
    color: 'text-amber-400 bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  api_abuse: {
    label: 'API Abuse',
    description: 'Rate limit evasion, schema probing, token forgery, scraping',
    color: 'text-cyan-400 bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  unknown: {
    label: 'Unknown Threat',
    description: 'Unclassified security telemetry or unparsed payload',
    color: 'text-slate-400 bg-slate-500/10',
    border: 'border-slate-500/30',
  },
};

export const MODALITY_CONFIG: Record<
  InputModality,
  {
    label: string;
    category: ThreatCategory;
  }
> = {
  email: { label: 'Email', category: 'phishing' },
  url: { label: 'URL / Domain', category: 'phishing' },
  sms: { label: 'SMS / Smishing', category: 'phishing' },
  qr: { label: 'QR Code / Quishing', category: 'phishing' },
  image: { label: 'Image', category: 'deepfake' },
  video: { label: 'Video', category: 'deepfake' },
  audio: { label: 'Audio / Voice', category: 'deepfake' },
  auth_log: { label: 'Auth Log', category: 'log_anomaly' },
  system_log: { label: 'System Log', category: 'log_anomaly' },
  api_log: { label: 'API Log', category: 'api_abuse' },
};

export const STATUS_CONFIG: Record<
  EventStatus,
  {
    label: string;
    color: string;
    pulse?: boolean;
  }
> = {
  received: { label: 'Received', color: 'text-slate-400 bg-slate-500/10' },
  processing: { label: 'Processing', color: 'text-cyan-400 bg-cyan-500/10', pulse: true },
  scored: { label: 'Scored', color: 'text-indigo-400 bg-indigo-500/10' },
  complete: { label: 'Complete', color: 'text-emerald-400 bg-emerald-500/10' },
  escalated: { label: 'Escalated', color: 'text-red-400 bg-red-500/10', pulse: true },
  failed: { label: 'Failed', color: 'text-rose-400 bg-rose-500/10' },
};

export const COMMON_MITRE_TECHNIQUES: MitreTechnique[] = [
  {
    id: 'T1566.001',
    name: 'Phishing: Spearphishing Attachment',
    tactic: 'Initial Access',
    description: 'Adversaries send spearphishing emails with malicious attachments to gain code execution.',
    url: 'https://attack.mitre.org/techniques/T1566/001/',
    detectedCount: 42,
  },
  {
    id: 'T1566.002',
    name: 'Phishing: Spearphishing Link',
    tactic: 'Initial Access',
    description: 'Adversaries send spearphishing emails with malicious links to lure victims into credential harvest sites.',
    url: 'https://attack.mitre.org/techniques/T1566/002/',
    detectedCount: 68,
  },
  {
    id: 'T1110.003',
    name: 'Brute Force: Password Spraying',
    tactic: 'Credential Access',
    description: 'Adversaries use a single password against many accounts to avoid account lockouts.',
    url: 'https://attack.mitre.org/techniques/T1110/003/',
    detectedCount: 29,
  },
  {
    id: 'T1078.004',
    name: 'Valid Accounts: Cloud Accounts',
    tactic: 'Defense Evasion',
    description: 'Adversaries obtain credentials of cloud administrative or service accounts.',
    url: 'https://attack.mitre.org/techniques/T1078/004/',
    detectedCount: 14,
  },
  {
    id: 'T1059.006',
    name: 'Command and Scripting Interpreter: Python',
    tactic: 'Execution',
    description: 'Adversaries may execute malicious payloads leveraging Python interpreters.',
    url: 'https://attack.mitre.org/techniques/T1059/006/',
    detectedCount: 9,
  },
  {
    id: 'T1656',
    name: 'Impersonation: Synthetic Audio & Video',
    tactic: 'Initial Access / Defense Evasion',
    description: 'Adversaries synthesize voice or video avatars to impersonate company executives.',
    url: 'https://attack.mitre.org/techniques/T1656/',
    detectedCount: 19,
  },
  {
    id: 'T1071.001',
    name: 'Application Layer Protocol: Web Protocols',
    tactic: 'Command and Control',
    description: 'Adversaries communicate using HTTP/HTTPS to blend in with legitimate network traffic.',
    url: 'https://attack.mitre.org/techniques/T1071/001/',
    detectedCount: 51,
  },
];
