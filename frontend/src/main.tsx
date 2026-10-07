import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import type { DashboardStats, Threat } from './types'
import { ExplainPanel } from './components/ExplainPanel'
import { ThreatCard } from './components/ThreatCard'
import { ThreatStats } from './components/ThreatStats'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useThreatStream } from './hooks/useThreatStream'

const MOCK_THREAT: Threat = {
  event_id: 'demo-abc-123',
  category: 'phishing',
  modality: 'email',
  risk_level: 'high',
  confidence: 0.94,
  label: 'phishing',
  indicators: ['Domain spoofing detected', 'Urgent credential language', 'Suspicious link in body'],
  explanation:
    'High risk: the sender domain closely resembles a legitimate organisation and the message requests immediate credential verification, consistent with spear-phishing TTPs.',
  recommended_actions: ['Quarantine the email', 'Warn the recipient', 'Block the sender domain'],
  mitre_mapping: ['T1566.001', 'T1598'],
}

const MOCK_STATS: DashboardStats = {
  total_events: 1847,
  threats_detected: 234,
  by_category: { phishing: 145, deepfake: 61, log_anomaly: 28 },
  by_risk_level: { safe: 0, critical: 12, high: 47, medium: 89, low: 86 },
}

function Dashboard() {
  const [selected, setSelected] = useState<Threat>(MOCK_THREAT)
  const token = localStorage.getItem('token') ?? ''
  const { threats, connected } = useThreatStream(token, [MOCK_THREAT])
  const { stats } = useDashboardStats(token, MOCK_STATS)

  useEffect(() => {
    if (threats[0] && threats[0].event_id !== selected.event_id) {
      setSelected(threats[0])
    }
  }, [threats])

  return (
    <div className="app-shell">
      {/* Top navigation bar */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-mark" aria-hidden="true">CG</div>
          <div>
            <span className="eyebrow">CyberGuard</span>
            <span className="app-title">Threat Operations</span>
          </div>
        </div>
        <span className={`live-status ${connected ? 'connected' : ''}`} role="status" aria-live="polite">
          <span className="pulse" aria-hidden="true" />
          {connected ? 'Live stream active' : 'Demo mode'}
        </span>
      </header>

      {/* KPI stat cards */}
      <ThreatStats stats={stats} />

      {/* Main workspace: feed + detail panel */}
      <main className="workspace">
        <section aria-label="Threat feed">
          <div className="section-heading">
            <span>Recent detections</span>
            <span className="muted">{threats.length} events</span>
          </div>
          <div className="feed">
            {threats.map(threat => (
              <ThreatCard
                key={threat.event_id}
                threat={threat}
                selected={selected.event_id === threat.event_id}
                onSelect={() => setSelected(threat)}
              />
            ))}
          </div>
        </section>

        <ExplainPanel threat={selected} />
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>
)
