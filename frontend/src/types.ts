export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'

export type Threat = {
  event_id: string
  category: string
  modality: string
  risk_level: RiskLevel
  confidence: number
  label: string
  indicators: string[]
  explanation: string
  recommended_actions: string[]
  mitre_mapping: string[]
  timestamp?: string
}

export type DashboardStats = {
  total_events: number
  threats_detected: number
  by_category: Record<string, number>
  by_risk_level: Record<RiskLevel, number>
}
