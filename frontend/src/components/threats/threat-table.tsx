import React from 'react';
import { ThreatEvent } from '@/types/threat';
import { Badge } from '@/components/ui/badge';
import { formatTimeAgo, formatConfidence } from '@/lib/utils';
import { AlertCircle, Terminal, Eye, MailWarning } from 'lucide-react';

interface ThreatTableProps {
  threats: ThreatEvent[];
  onSelectThreat: (threat: ThreatEvent) => void;
}

const MODALITY_ICONS: Record<string, React.ReactNode> = {
  log_anomaly: <Terminal className="h-4 w-4" />,
  deepfake: <Eye className="h-4 w-4" />,
  phishing: <MailWarning className="h-4 w-4" />,
  api_abuse: <AlertCircle className="h-4 w-4" />,
};

export function ThreatTable({ threats, onSelectThreat }: ThreatTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-[#30363d] bg-[#161b22]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#c9d1d9]">
          <thead className="bg-[#21262d] text-xs font-semibold uppercase text-[#8b949e]">
            <tr>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d]">Severity</th>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d]">Type</th>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d]">Incident Label</th>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d] hidden md:table-cell">Source</th>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d] text-right">Confidence</th>
              <th scope="col" className="px-4 py-3 border-b border-[#30363d] text-right hidden sm:table-cell">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {threats.map((threat) => (
              <tr
                key={threat.event_id}
                onClick={() => onSelectThreat(threat)}
                className="hover:bg-[#21262d] transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <Badge risk={threat.risk_level || 'medium'} variant="risk" />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8b949e]">
                      {MODALITY_ICONS[threat.modality] || <AlertCircle className="h-4 w-4" />}
                    </span>
                    <span className="capitalize">{threat.modality.replace('_', ' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-[#e6edf3] group-hover:text-[#58a6ff] transition-colors truncate max-w-[200px] lg:max-w-[400px]">
                    {threat.label || 'Unlabeled Incident'}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#8b949e] hidden md:table-cell whitespace-nowrap">
                  {threat.source}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span className="font-semibold text-[#3fb950]">
                    {formatConfidence(threat.confidence)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[#8b949e] hidden sm:table-cell whitespace-nowrap text-xs">
                  {formatTimeAgo(threat.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
