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
    badgeBg: 'bg-[#ff3366]/15',
    badgeText: 'text-[#ff3366]',
    border: 'border-[#ff3366]/60',
    glow: 'shadow-[0_0_12px_rgba(255,51,102,0.45)]',
    hex: '#ff3366',
    dotBg: 'bg-[#ff3366]',
  },
  high: {
    label: 'HIGH',
    badgeBg: 'bg-[#ff8800]/15',
    badgeText: 'text-[#ff8800]',
    border: 'border-[#ff8800]/60',
    glow: 'shadow-[0_0_12px_rgba(255,136,0,0.4)]',
    hex: '#ff8800',
    dotBg: 'bg-[#ff8800]',
  },
  medium: {
    label: 'MEDIUM',
    badgeBg: 'bg-[#ffb800]/15',
    badgeText: 'text-[#ffb800]',
    border: 'border-[#ffb800]/60',
    glow: 'shadow-[0_0_12px_rgba(255,184,0,0.35)]',
    hex: '#ffb800',
    dotBg: 'bg-[#ffb800]',
  },
  low: {
    label: 'LOW',
    badgeBg: 'bg-[#00d4ff]/15',
    badgeText: 'text-[#00d4ff]',
    border: 'border-[#00d4ff]/60',
    glow: 'shadow-[0_0_12px_rgba(0,212,255,0.35)]',
    hex: '#00d4ff',
    dotBg: 'bg-[#00d4ff]',
  },
  safe: {
    label: 'SAFE',
    badgeBg: 'bg-[#00ff88]/15',
    badgeText: 'text-[#00ff88]',
    border: 'border-[#00ff88]/60',
    glow: 'shadow-[0_0_12px_rgba(0,255,136,0.35)]',
    hex: '#00ff88',
    dotBg: 'bg-[#00ff88]',
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
    color: 'text-[#ff00ff] bg-[#ff00ff]/10',
    border: 'border-[#ff00ff]/40 shadow-[0_0_8px_rgba(255,0,255,0.2)]',
  },
  deepfake: {
    label: 'Deepfake Media',
    description: 'Manipulated biometric media, synthetic voice audio, face swaps',
    color: 'text-[#00d4ff] bg-[#00d4ff]/10',
    border: 'border-[#00d4ff]/40 shadow-[0_0_8px_rgba(0,212,255,0.2)]',
  },
  log_anomaly: {
    label: 'Log Anomaly',
    description: 'Privilege escalation, auth spray, credential stuffing, anomalous sys logs',
    color: 'text-[#ffb800] bg-[#ffb800]/10',
    border: 'border-[#ffb800]/40 shadow-[0_0_8px_rgba(255,184,0,0.2)]',
  },
  api_abuse: {
    label: 'API Abuse',
    description: 'Rate limit evasion, schema probing, token forgery, scraping',
    color: 'text-[#00ff88] bg-[#00ff88]/10',
    border: 'border-[#00ff88]/40 shadow-[0_0_8px_rgba(0,255,136,0.2)]',
  },
  unknown: {
    label: 'Unknown Threat',
    description: 'Unclassified security telemetry or unparsed payload',
    color: 'text-slate-400 bg-slate-500/10',
    border: 'border-slate-700/60',
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
  received: { label: 'Received', color: 'text-slate-400 bg-[#12121a] border-[#2a2a3a]' },
  processing: { label: 'Processing', color: 'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/40 shadow-[0_0_6px_rgba(0,212,255,0.3)]', pulse: true },
  scored: { label: 'Scored', color: 'text-[#ff00ff] bg-[#ff00ff]/10 border-[#ff00ff]/40' },
  complete: { label: 'Complete', color: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/40 shadow-[0_0_6px_rgba(0,255,136,0.3)]' },
  escalated: { label: 'Escalated', color: 'text-[#ff3366] bg-[#ff3366]/15 border-[#ff3366]/50 shadow-[0_0_8px_rgba(255,51,102,0.4)]', pulse: true },
  failed: { label: 'Failed', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
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
