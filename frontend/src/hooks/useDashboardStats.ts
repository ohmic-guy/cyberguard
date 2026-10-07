import { useEffect, useState } from 'react'
import type { DashboardStats } from '../types'

export function useDashboardStats(token: string, fallback: DashboardStats) {
  const [stats, setStats] = useState(fallback)
  useEffect(() => {
    if (!token) return
    fetch('/api/v1/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => response.ok ? response.json() as Promise<DashboardStats> : Promise.reject(new Error('Stats request failed')))
      .then(setStats)
      .catch(() => setStats(fallback))
  }, [token, fallback])
  return { stats }
}
