'use client'

import { useEffect, useRef } from 'react'
import { useFirebaseUser } from '@/lib/use-auth'
import { useCollabStore } from '@/lib/collaboration/collab-store'
import type { CollabUser } from '@/lib/collaboration/types'

const COLORS = [
  '#e63946', '#f4a261', '#2a9d8f', '#457b9d',
  '#6a4c93', '#f72585', '#06d6a0', '#ffd166',
]

function hashColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return COLORS[hash % COLORS.length]!
}

function getSceneIdFromPath(pathname: string): string | null {
  const match = /\/scene\/([^/]+)/.exec(pathname)
  return match?.[1] ?? null
}

function Avatar({ user }: { user: CollabUser }) {
  return (
    <div className="relative group" title={user.name}>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-background select-none"
        style={{ backgroundColor: user.color }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block whitespace-nowrap rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border border-border">
        {user.name}
      </div>
    </div>
  )
}

export function PresenceBar() {
  const { user } = useFirebaseUser()
  const { status, room, localUser, joinRoom, leaveRoom, setUsers, setStatus } = useCollabStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const registeredRef = useRef(false)

  const sceneId =
    typeof window !== 'undefined' ? getSceneIdFromPath(window.location.pathname) : null

  useEffect(() => {
    if (!sceneId || !user) return

    const color = hashColor(user.uid)
    const name = user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous'
    const roomUser: CollabUser = {
      id: user.uid,
      name,
      color,
      lastSeen: Date.now(),
    }

    setStatus('connecting')

    // Register presence
    fetch('/api/collab/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: sceneId, userId: user.uid, name, color }),
    })
      .then(() => {
        joinRoom(sceneId, roomUser)
        registeredRef.current = true
      })
      .catch(() => setStatus('error'))

    // Poll for presence
    intervalRef.current = setInterval(() => {
      // Re-register self (heartbeat)
      fetch('/api/collab/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: sceneId, userId: user.uid, name, color }),
      }).catch(() => {})

      // Fetch all users
      fetch(`/api/collab/presence?roomId=${sceneId}`)
        .then((r) => r.ok ? r.json() : null)
        .then((data: { users?: CollabUser[] } | null) => {
          if (data?.users) setUsers(data.users)
        })
        .catch(() => {})
    }, 5_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (registeredRef.current) {
        fetch('/api/collab/presence', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: sceneId, userId: user.uid }),
        }).catch(() => {})
        registeredRef.current = false
        leaveRoom()
      }
    }
  }, [sceneId, user, joinRoom, leaveRoom, setUsers, setStatus])

  if (!sceneId) return null

  const visibleUsers = (room?.users ?? []).slice(0, 5)
  const isConnected = status === 'connected'

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-muted-foreground'}`}
        title={isConnected ? 'Live' : 'Disconnected'}
      />
      <div className="flex -space-x-2">
        {visibleUsers.map((u) => (
          <Avatar key={u.id} user={u} />
        ))}
      </div>
    </div>
  )
}
