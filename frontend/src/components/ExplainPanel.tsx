import type { Threat } from '../types'
import { MitreBadge } from './MitreBadge'
import { RiskBadge } from './RiskBadge'

export function ExplainPanel({ threat }: { threat: Threat }) {
  return (
    <aside className="explain-panel" aria-label="Threat detail panel">
      <div className="panel-header">
        <div className="panel-heading">
          <span className="panel-title">Threat Brief</span>
          <RiskBadge level={threat.risk_level} />
        </div>
        <div className="panel-heading" style={{ marginTop: 4 }}>
          <span style={{ font: '500 12px var(--font-mono)', color: 'var(--ink-3)' }}>
            {threat.category.replace('_', ' ')} · {threat.modality}
          </span>
          <span className="confidence-chip">
            {Math.round(threat.confidence * 100)}%
          </span>
        </div>
      </div>

      <p className="explanation">{threat.explanation}</p>

      {threat.indicators.length > 0 && (
        <div className="panel-section">
          <p className="panel-section-title">Indicators</p>
          <ul>
            {threat.indicators.map(indicator => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
        </div>
      )}

      {threat.recommended_actions.length > 0 && (
        <div className="panel-section">
          <p className="panel-section-title">Recommended Actions</p>
          <ol>
            {threat.recommended_actions.map(action => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </div>
      )}

      {threat.mitre_mapping.length > 0 && (
        <div className="panel-section">
          <p className="panel-section-title">MITRE ATT&CK</p>
          <div className="mitre-list">
            {threat.mitre_mapping.map(technique => (
              <MitreBadge key={technique} technique={technique} />
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
