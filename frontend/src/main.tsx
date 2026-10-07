import { StrictMode, useState } from 'react'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import type { DashboardStats, Threat } from './types'
import { ExplainPanel } from './components/ExplainPanel'
import { ThreatCard } from './components/ThreatCard'
import { ThreatStats } from './components/ThreatStats'
import { useDashboardStats } from './hooks/useDashboardStats'
import { useThreatStream } from './hooks/useThreatStream'

const MOCK_THREAT: Threat = {
  event_id: 'abc-123', category: 'phishing', modality: 'email', risk_level: 'high', confidence: 0.94,
  label: 'phishing', indicators: ['Domain spoofing', 'Urgent language', 'Credential request'],
  explanation: 'High risk: sender domain closely resembles an authorised organisation and asks the recipient to verify credentials.',
  recommended_actions: ['Quarantine email', 'Warn user', 'Block domain'], mitre_mapping: ['T1566.001', 'T1598'],
}
const MOCK_STATS: DashboardStats = {
  total_events: 1847, threats_detected: 234,
  by_category: { phishing: 145, deepfake: 61, log_anomaly: 28 },
  by_risk_level: { safe: 0, critical: 12, high: 47, medium: 89, low: 86 },
}

function Dashboard() {
  const [selected, setSelected] = useState(MOCK_THREAT)
  const token = localStorage.getItem('token') ?? ''
  const { threats, connected } = useThreatStream(token, [MOCK_THREAT])
  const { stats } = useDashboardStats(token, MOCK_STATS)
  useEffect(() => {
    if (threats[0]) setSelected(threats[0])
  }, [threats])
  return <main className="app-shell">
    <header className="topbar"><div><span className="eyebrow">CYBERGUARD / COMMAND</span><h1>Threat operations</h1></div><span className="live-status"><i /> {connected ? 'Live stream online' : 'Demo stream online'}</span></header>
    <ThreatStats stats={stats} />
    <section className="workspace"><div className="feed"><div className="section-heading"><span>Recent detections</span><span className="muted">{threats.length} events</span></div>{threats.map(threat => <ThreatCard key={threat.event_id} threat={threat} selected={selected.event_id === threat.event_id} onSelect={() => setSelected(threat)} />)}</div><ExplainPanel threat={selected} /></section>
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><Dashboard /></StrictMode>)
