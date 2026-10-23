'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { YjsSceneBridge } from './yjs-scene-bridge'
import { useCollabStore } from './collab-store'

export type CollabSessionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface UseCollabSessionOptions {
  sceneId: string
  enabled: boolean
  userId?: string
  userName?: string
}

export function useCollabSession({ sceneId, enabled, userId, userName }: UseCollabSessionOptions) {
  const bridgeRef = useRef<YjsSceneBridge | null>(null)
  const [status, setStatus] = useState<CollabSessionStatus>('disconnected')
  const { setStatus: setStoreStatus, joinRoom, leaveRoom } = useCollabStore()

  useEffect(() => {
    if (!enabled) {
      leaveRoom()
      setStatus('disconnected')
      return
    }

    setStatus('connecting')
    setStoreStatus('connecting')

    const bridge = new YjsSceneBridge({
      roomId: sceneId,
      pollMs: 1000,
      onStatus: (s) => {
        setStatus(s)
        setStoreStatus(s)
        if (s === 'connected' && userId) {
          joinRoom(sceneId, {
            id: userId,
            name: userName ?? 'Anonymous',
            color: `hsl(${Math.abs(userId.charCodeAt(0) * 37) % 360}, 60%, 50%)`,
            lastSeen: Date.now(),
          })
        }
      },
    })

    bridgeRef.current = bridge
    void bridge.start()

    return () => {
      bridge.stop()
      bridgeRef.current = null
      leaveRoom()
      setStatus('disconnected')
      setStoreStatus('disconnected')
    }
  }, [enabled, sceneId, userId, userName, setStoreStatus, joinRoom, leaveRoom])

  const reconnect = useCallback(() => {
    const bridge = bridgeRef.current
    if (!bridge) return
    bridge.stop()
    const fresh = new YjsSceneBridge({
      roomId: sceneId,
      pollMs: 1000,
      onStatus: (s) => { setStatus(s); setStoreStatus(s) },
    })
    bridgeRef.current = fresh
    void fresh.start()
  }, [sceneId, setStoreStatus])

  return { status, reconnect }
}
