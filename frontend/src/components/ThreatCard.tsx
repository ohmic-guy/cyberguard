import type { Threat } from '../types'
import { RiskBadge } from './RiskBadge'

export function ThreatCard({ threat, selected, onSelect }: { threat: Threat; selected: boolean; onSelect: () => void }) {
  return <button className={`threat-card ${selected ? 'selected' : ''}`} onClick={onSelect}>
    <div className="card-topline"><span>{threat.category.replace('_', ' ')}</span><RiskBadge level={threat.risk_level} /></div>
    <h3>{threat.label}</h3>
    <p>{threat.modality} <span aria-hidden="true">/</span> {Math.round(threat.confidence * 100)}% confidence</p>
    <span className="event-id">{threat.event_id}</span>
  </button>
}
