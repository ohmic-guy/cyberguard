'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThreatEvent, DashboardMetrics, ThreatCategory, InputModality, RiskLevel } from '@/types/threat';
import { api } from '@/lib/api';
import { useWebSocket } from '@/hooks/use-websocket';

export function useThreats(filters?: {
  category?: ThreatCategory;
  modality?: InputModality;
  risk?: RiskLevel;
  search?: string;
}) {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { latestEvent } = useWebSocket();

  const fetchThreats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const category = filters?.category;
    const modality = filters?.modality;
    const risk = filters?.risk;
    const search = filters?.search;

    try {
      const [fetchedThreats, fetchedMetrics] = await Promise.all([
        api.getThreats({ category, modality, risk, search }),
        api.getMetrics(),
      ]);
      setThreats(fetchedThreats);
      setMetrics(fetchedMetrics);
    } catch (err: any) {
      setError(err?.message || 'Failed to load telemetry data');
    } finally {
      setIsLoading(false);
    }
  }, [filters?.category, filters?.modality, filters?.risk, filters?.search]);

  useEffect(() => {
    fetchThreats();
  }, [fetchThreats]);

  useEffect(() => {
    if (!latestEvent || latestEvent.status !== 'complete') return;
    const matches = (!filters?.category || latestEvent.category === filters.category)
      && (!filters?.modality || latestEvent.modality === filters.modality)
      && (!filters?.risk || latestEvent.risk_level === filters.risk);
    if (!matches) return;
    setThreats((previous) => [
      latestEvent,
      ...previous.filter((item) => item.event_id !== latestEvent.event_id),
    ]);
    api.getMetrics().then(setMetrics).catch(() => undefined);
  }, [latestEvent, filters?.category, filters?.modality, filters?.risk]);

  const addLiveThreat = useCallback((event: ThreatEvent) => {
    setThreats((prev) => {
      // Avoid duplicate event_ids
      if (prev.some((t) => t.event_id === event.event_id)) return prev;
      return [event, ...prev];
    });
  }, []);

  return {
    threats,
    metrics,
    isLoading,
    error,
    refetch: fetchThreats,
    addLiveThreat,
  };
}
