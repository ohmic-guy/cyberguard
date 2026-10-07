import { useEffect, useState } from 'react'
import type { Threat } from '../types'

export function useThreatStream(token: string, initialThreats: Threat[] = []) {
  const [threats, setThreats] = useState<Threat[]>(initialThreats)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/threats?token=${encodeURIComponent(token)}`)
    let pingTimer: number | undefined
    socket.onopen = () => {
      setConnected(true)
      pingTimer = window.setInterval(() => socket.send('{"type":"ping"}'), 30000)
    }
    socket.onmessage = event => {
      const message = JSON.parse(event.data) as { type: string; [key: string]: unknown }
      if (message.type !== 'threat.complete') return
      setThreats(current => [message as unknown as Threat, ...current].slice(0, 50))
    }
    socket.onclose = () => setConnected(false)
    return () => {
      if (pingTimer !== undefined) window.clearInterval(pingTimer)
      socket.close()
    }
  }, [token])

  return { threats, connected }
}
