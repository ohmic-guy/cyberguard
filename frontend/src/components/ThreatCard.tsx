import type { Threat } from '../types'
import { RiskBadge } from './RiskBadge'

export function ThreatCard({
  threat,
  selected,
  onSelect,
}: {
  threat: Threat
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      className={`threat-card risk-${threat.risk_level} ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <div className="card-topline">
        <span className="card-category">{threat.category.replace('_', ' ')}</span>
        <RiskBadge level={threat.risk_level} />
      </div>
      <h3>{threat.label}</h3>
      <p>
        {threat.modality}&nbsp;&nbsp;·&nbsp;&nbsp;
        {Math.round(threat.confidence * 100)}% confidence
      </p>
      <span className="event-id muted">{threat.event_id}</span>
    </button>
  )
}
