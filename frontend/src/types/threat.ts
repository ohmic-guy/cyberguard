export type ThreatCategory = 
  | 'phishing'
  | 'deepfake'
  | 'log_anomaly'
  | 'api_abuse'
  | 'unknown';

export type InputModality = 
  | 'email'
  | 'url'
  | 'sms'
  | 'qr'
  | 'image'
  | 'video'
  | 'audio'
  | 'auth_log'
  | 'system_log'
  | 'api_log';

export type RiskLevel = 
  | 'safe'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export type EventStatus = 
  | 'received'
  | 'processing'
  | 'scored'
  | 'complete'
  | 'escalated'
  | 'failed';

export interface ThreatEvent {
  event_id: string;
  created_at: string;
  updated_at: string;
  category: ThreatCategory;
  modality: InputModality;
  status: EventStatus;
  source: string;
  payload: Record<string, any>;
  label?: string | null;
  confidence?: number | null; // 0.0 to 1.0
  indicators: string[];
  risk_level?: RiskLevel | null;
  score_factors: string[];
  explanation?: string | null;
  recommended_actions: string[];
  mitre_mapping: string[];
  error_message?: string | null;
  failed_agent?: string | null;
}

export interface DashboardMetrics {
  total_events: number;
  critical_threats: number;
  high_threats: number;
  medium_threats: number;
  safe_or_low: number;
  avg_confidence: number;
  processing_rate: number; // events/min
  active_agents: number;
  category_distribution: Record<ThreatCategory, number>;
  risk_distribution: Record<RiskLevel, number>;
  tactic_distribution?: Record<string, number>;
}

export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  description: string;
  url: string;
  detectedCount: number;
}
