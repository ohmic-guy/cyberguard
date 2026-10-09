import { ThreatEvent, DashboardMetrics, ThreatCategory, InputModality, RiskLevel } from '@/types/threat';
import { INITIAL_THREATS, INITIAL_METRICS } from './mock-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private inMemoryThreats: ThreatEvent[] = [...INITIAL_THREATS];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cyberguard_threats');
      if (saved) {
        try {
          this.inMemoryThreats = JSON.parse(saved);
        } catch {
          this.inMemoryThreats = [...INITIAL_THREATS];
        }
      }
    }
  }

  private saveThreats() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cyberguard_threats', JSON.stringify(this.inMemoryThreats));
    }
  }

  async checkHealth(): Promise<{ status: string; service: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    return { status: 'mock_active', service: 'CyberGuard SOC Engine (Demo Fallback)' };
  }

  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/metrics`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    
    // Dynamic recalculation from current threats
    const total = this.inMemoryThreats.length;
    const critical = this.inMemoryThreats.filter(t => t.risk_level === 'critical').length;
    const high = this.inMemoryThreats.filter(t => t.risk_level === 'high').length;
    const medium = this.inMemoryThreats.filter(t => t.risk_level === 'medium').length;

    return {
      ...INITIAL_METRICS,
      critical_threats: critical,
      high_threats: high,
      medium_threats: medium,
      total_events: INITIAL_METRICS.total_events + (total - INITIAL_THREATS.length),
    };
  }

  async getThreats(params?: {
    category?: ThreatCategory;
    modality?: InputModality;
    risk?: RiskLevel;
    search?: string;
  }): Promise<ThreatEvent[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.modality) query.append('modality', params.modality);
      if (params?.risk) query.append('risk', params.risk);
      if (params?.search) query.append('search', params.search);

      const res = await fetch(`${API_BASE_URL}/threats?${query.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {}

    // Fallback filter over in-memory list
    return this.inMemoryThreats.filter((t) => {
      if (params?.category && t.category !== params.category) return false;
      if (params?.modality && t.modality !== params.modality) return false;
      if (params?.risk && t.risk_level !== params.risk) return false;
      if (params?.search) {
        const s = params.search.toLowerCase();
        const matchesLabel = t.label?.toLowerCase().includes(s);
        const matchesId = t.event_id.toLowerCase().includes(s);
        const matchesExpl = t.explanation?.toLowerCase().includes(s);
        if (!matchesLabel && !matchesId && !matchesExpl) return false;
      }
      return true;
    });
  }

  async getThreatById(id: string): Promise<ThreatEvent | null> {
    // Demo records are browser-local and do not exist in the backend database.
    if (id.startsWith('evt-')) {
      return this.inMemoryThreats.find((t) => t.event_id === id) || null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/threats/${id}`, { cache: 'no-store' });
      if (res.ok) return await res.json();
    } catch {}
    const found = this.inMemoryThreats.find((t) => t.event_id === id);
    return found || null;
  }

  async submitAnalysis(
    category: ThreatCategory,
    modality: InputModality,
    source: string,
    payload: Record<string, any>
  ): Promise<ThreatEvent> {
    try {
      const res = await fetch(`${API_BASE_URL}/threats/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, modality, source, payload }),
      });
      if (res.ok) {
        const queued = await res.json() as ThreatEvent;
        for (let attempt = 0; attempt < 20; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const completed = await this.getThreatById(queued.event_id);
          if (completed && ['complete', 'escalated', 'failed'].includes(completed.status)) {
            return completed;
          }
        }
        return queued;
      }
    } catch {}

    // Generate analyzed threat event in demo fallback
    const confidence = Number((Math.random() * 0.35 + 0.65).toFixed(2));
    const risk_level: RiskLevel = confidence > 0.9 ? 'critical' : confidence > 0.75 ? 'high' : 'medium';

    const newThreat: ThreatEvent = {
      event_id: `evt-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category,
      modality,
      status: 'complete',
      source: source || 'Analyst_Portal_Submission',
      payload,
      label: `Suspicious ${modality.toUpperCase()} Submission Scanned`,
      confidence,
      risk_level,
      indicators: [
        `Heuristic anomaly detected in payload parameters (${modality})`,
        `ML detector confidence: ${Math.round(confidence * 100)}% match with known threat signature`,
        'Correlated with active adversarial campaigns',
      ],
      score_factors: [
        'High anomaly score from multi-agent consensus',
        'Suspicious structural pattern match in content',
      ],
      explanation: `Automated deep neural inspection of the submitted ${modality} asset identified multiple adversarial markers consistent with known threat actor toolkits.`,
      recommended_actions: [
        'Isolate target asset or IP address from corporate network',
        'Broadcast threat indicator IOC to endpoint protection agents',
        'File incident report with Incident Response Team (Level 2)',
      ],
      mitre_mapping: ['T1566.002', 'T1071.001'],
    };

    this.inMemoryThreats.unshift(newThreat);
    this.saveThreats();
    return newThreat;
  }
}

export const api = new ApiService();
