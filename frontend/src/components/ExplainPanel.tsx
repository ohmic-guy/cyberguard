import type { Threat } from '../types'
import { MitreBadge } from './MitreBadge'

export function ExplainPanel({ threat }: { threat: Threat }) {
  return <aside className="explain-panel">
    <div className="panel-heading"><span>Threat brief</span><span className="confidence">{Math.round(threat.confidence * 100)}%</span></div>
    <p className="explanation">{threat.explanation}</p>
    <h4>Indicators</h4>
    <ul>{threat.indicators.map(indicator => <li key={indicator}>{indicator}</li>)}</ul>
    <h4>Recommended actions</h4>
    <ol>{threat.recommended_actions.map(action => <li key={action}>{action}</li>)}</ol>
    <h4>MITRE ATT&CK</h4>
    <div className="mitre-list">{threat.mitre_mapping.map(technique => <MitreBadge key={technique} technique={technique} />)}</div>
  </aside>
}
