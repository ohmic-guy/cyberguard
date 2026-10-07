import type { RiskLevel } from '../types'

const labels: Record<RiskLevel, string> = {
  safe: 'Safe',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return <span className={`risk-badge risk-${level}`}>{labels[level]}</span>
}
