import type { DashboardStats } from '../types'

export function ThreatStats({ stats }: { stats: DashboardStats }) {
  const cards = [
    ['Total events', stats.total_events.toLocaleString(), 'events observed'],
    ['Threats detected', stats.threats_detected.toLocaleString(), 'requiring review'],
    ['Phishing', stats.by_category.phishing.toLocaleString(), 'active category'],
    ['Critical', stats.by_risk_level.critical.toLocaleString(), 'priority alerts'],
  ]
  return <section className="stats-grid" aria-label="Threat statistics">
    {cards.map(([label, value, note]) => <article className="stat-card" key={label}>
      <span>{label}</span><strong>{value}</strong><small>{note}</small>
    </article>)}
  </section>
}
