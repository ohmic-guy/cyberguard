import type { RiskLevel } from '../types'

const LABELS: Record<RiskLevel, string> = {
  safe:     '● Safe',
  low:      '● Low',
  medium:   '▲ Medium',
  high:     '▲ High',
  critical: '■ Critical',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`risk-badge risk-${level}`} aria-label={`Risk level: ${level}`}>
      {LABELS[level] ?? level}
    </span>
  )
}
