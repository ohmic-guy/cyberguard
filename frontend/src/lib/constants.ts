import { RiskLevel, EventStatus, ThreatCategory } from '@/types/threat';

export const RISK_LEVEL_CONFIG: Record<
  RiskLevel,
  { label: string; bg: string; badgeText: string; border: string; hex: string; dotBg: string }
> = {
  critical: {
    label: 'CRITICAL',
    bg: 'bg-[#f85149]/10',
    badgeText: 'text-[#f85149]',
    border: 'border-[#f85149]/25',
    hex: '#f85149',
    dotBg: 'bg-[#f85149]',
  },
  high: {
    label: 'HIGH',
    bg: 'bg-[#d29922]/10',
    badgeText: 'text-[#d29922]',
    border: 'border-[#d29922]/25',
    hex: '#d29922',
    dotBg: 'bg-[#d29922]',
  },
  medium: {
    label: 'MEDIUM',
    bg: 'bg-[#58a6ff]/10',
    badgeText: 'text-[#58a6ff]',
    border: 'border-[#58a6ff]/25',
    hex: '#58a6ff',
    dotBg: 'bg-[#58a6ff]',
  },
  low: {
    label: 'LOW',
    bg: 'bg-[#3fb950]/10',
    badgeText: 'text-[#3fb950]',
    border: 'border-[#3fb950]/25',
    hex: '#3fb950',
    dotBg: 'bg-[#3fb950]',
  },
  safe: {
    label: 'SAFE',
    bg: 'bg-[#8b949e]/10',
    badgeText: 'text-[#8b949e]',
    border: 'border-[#30363d]',
    hex: '#8b949e',
    dotBg: 'bg-[#8b949e]',
  },
};

export const CATEGORY_CONFIG: Record<
  ThreatCategory,
  { label: string; color: string; border: string; icon: string }
> = {
  phishing: {
    label: 'Phishing',
    color: 'text-[#f85149] bg-transparent',
    border: 'border-[#f85149]/25',
    icon: 'MailWarning',
  },
  deepfake: {
    label: 'Deepfake',
    color: 'text-[#58a6ff] bg-transparent',
    border: 'border-[#58a6ff]/25',
    icon: 'Eye',
  },
  log_anomaly: {
    label: 'Log Anomaly',
    color: 'text-[#d29922] bg-transparent',
    border: 'border-[#d29922]/25',
    icon: 'FileTerminal',
  },
  api_abuse: {
    label: 'API Abuse',
    color: 'text-[#3fb950] bg-transparent',
    border: 'border-[#3fb950]/25',
    icon: 'Activity',
  },
  unknown: {
    label: 'Unknown',
    color: 'text-[#8b949e] bg-transparent',
    border: 'border-[#30363d]',
    icon: 'HelpCircle',
  },
};

export const STATUS_CONFIG: Record<EventStatus, { label: string; color: string; pulse?: boolean }> = {
  received: { label: 'Received', color: 'text-[#8b949e] bg-transparent border-[#30363d]' },
  processing: { label: 'Processing', color: 'text-[#58a6ff] bg-transparent border-[#58a6ff]/25', pulse: true },
  scored: { label: 'Scored', color: 'text-[#d29922] bg-transparent border-[#d29922]/25' },
  complete: { label: 'Complete', color: 'text-[#3fb950] bg-transparent border-[#3fb950]/25' },
  escalated: { label: 'Escalated', color: 'text-[#f85149] bg-transparent border-[#f85149]/25', pulse: true },
  failed: { label: 'Failed', color: 'text-[#f85149] bg-transparent border-[#f85149]/25' },
};

export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/events';

export const TACTICS_CONFIG: Record<string, { id: string; name: string }> = {
  initial_access: { id: 'TA0001', name: 'Initial Access' },
  execution: { id: 'TA0002', name: 'Execution' },
  persistence: { id: 'TA0003', name: 'Persistence' },
  privilege_escalation: { id: 'TA0004', name: 'Privilege Escalation' },
  defense_evasion: { id: 'TA0005', name: 'Defense Evasion' },
  credential_access: { id: 'TA0006', name: 'Credential Access' },
  discovery: { id: 'TA0007', name: 'Discovery' },
  lateral_movement: { id: 'TA0008', name: 'Lateral Movement' },
  collection: { id: 'TA0009', name: 'Collection' },
  command_and_control: { id: 'TA0011', name: 'Command & Control' },
  exfiltration: { id: 'TA0010', name: 'Exfiltration' },
  impact: { id: 'TA0040', name: 'Impact' },
};
