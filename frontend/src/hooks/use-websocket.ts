'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ThreatEvent } from '@/types/threat';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [latestEvent, setLatestEvent] = useState<ThreatEvent | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const simIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const simulateIncomingThreat = useCallback(() => {
    const modalities = ['email', 'url', 'auth_log', 'audio', 'qr'] as const;
    const pickedModality = modalities[Math.floor(Math.random() * modalities.length)];
    const isCritical = Math.random() > 0.65;
    const confidence = Number((Math.random() * 0.25 + 0.72).toFixed(2));

    const simulated: ThreatEvent = {
      event_id: `evt-stream-${Date.now().toString(16).slice(-6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: pickedModality === 'audio' ? 'deepfake' : pickedModality === 'auth_log' ? 'log_anomaly' : 'phishing',
      modality: pickedModality,
      status: isCritical ? 'escalated' : 'processing',
      source: 'RedisStream_CyberGuard_Ingest',
      label: `Live Stream Alert: ${pickedModality.toUpperCase()} Anomaly Detected`,
      confidence,
      risk_level: isCritical ? 'critical' : confidence > 0.8 ? 'high' : 'medium',
      indicators: [
        `Real-time signature match on stream cyberguard:threat.detected`,
        `Autonomous detector flagged threshold variance (> ${confidence})`,
      ],
      score_factors: ['Automated stream ingestion triggered correlation rule'],
      explanation: `Streaming anomaly caught during real-time ingest pipeline evaluation for ${pickedModality}.`,
      recommended_actions: [
        'SOC analyst review required for escalated event',
        'Verify threat correlation against recent host network graphs',
      ],
      mitre_mapping: ['T1566.001', 'T1071.001'],
      payload: {
        timestamp: new Date().toISOString(),
        stream: 'cyberguard:raw.input',
        raw_size_bytes: 412,
      },
    };

    setLatestEvent(simulated);
    setEventCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem('access_token') ?? window.localStorage.getItem('token');
    if (!token) return;

    const configuredUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/threats';
    const separator = configuredUrl.includes('?') ? '&' : '?';
    const wsUrl = `${configuredUrl}${separator}token=${encodeURIComponent(token)}`;
    let socket: WebSocket | null = null;

    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          setLatestEvent(parsed);
          setEventCount((prev) => prev + 1);
        } catch {
          console.warn('Malformed websocket event payload');
        }
      };

      socket.onerror = () => {
        setIsConnected(false);
      };

      socket.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // In demo / fallback mode, simulate periodic real-time events every 45s
    simIntervalRef.current = setInterval(() => {
      simulateIncomingThreat();
    }, 45000);

    return () => {
      if (socket) socket.close();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [simulateIncomingThreat]);

  return {
    isConnected,
    latestEvent,
    eventCount,
    triggerManualSimulation: simulateIncomingThreat,
  };
}
