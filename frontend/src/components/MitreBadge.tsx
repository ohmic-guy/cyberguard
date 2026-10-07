export function MitreBadge({ technique }: { technique: string }) {
  return (
    <a
      className="mitre-badge"
      href={`https://attack.mitre.org/techniques/${technique.replace('.', '/')}/`}
      target="_blank"
      rel="noopener noreferrer"
      title={`View ${technique} on MITRE ATT&CK`}
    >
      {technique}
    </a>
  )
}
