import type { DashboardStats } from '../types'

type StatConfig = {
  label: string
  sub: string
  getValue: (stats: DashboardStats) => number
}

const STATS: StatConfig[] = [
  {
    label: 'Total Events',
    sub: 'All time',
    getValue: s => s.total_events,
  },
  {
    label: 'Threats Detected',
    sub: 'Active threats',
    getValue: s => s.threats_detected,
  },
  {
    label: 'Critical',
    sub: 'Immediate action',
    getValue: s => s.by_risk_level.critical ?? 0,
  },
  {
    label: 'High Risk',
    sub: 'Needs review',
    getValue: s => s.by_risk_level.high ?? 0,
  },
]

export function ThreatStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="stats-grid" role="region" aria-label="Threat statistics">
      {STATS.map(({ label, sub, getValue }) => (
        <div key={label} className="stat-card">
          <span className="stat-label">{label}</span>
          <strong className="stat-value">{getValue(stats).toLocaleString()}</strong>
          <span className="stat-sub">{sub}</span>
        </div>
      ))}
    </div>
  )
}
