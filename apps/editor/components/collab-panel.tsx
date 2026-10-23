'use client'

import { useEffect, useRef } from 'react'
import { Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { useState } from 'react'
import { useCollabStore } from '@/lib/collaboration/collab-store'
import { useCollabSession } from '@/lib/collaboration/use-collab-session'
import type { CollabUser } from '@/lib/collaboration/types'
import { useFirebaseUser } from '@/lib/use-auth'

function getSceneIdFromPath(pathname: string): string | null {
  const match = /\/scene\/([^/]+)/.exec(pathname)
  return match?.[1] ?? null
}

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

function UserRow({ user, isLocal }: { user: CollabUser; isLocal: boolean }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: user.color }}
      >
        {user.name.charAt(0).toUpperCase()}
      </div>
      <span className="flex-1 truncate text-sm text-foreground">{user.name}</span>
      {isLocal && (
        <span className="text-xs text-muted-foreground">(you)</span>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const connected = status === 'connected'
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        connected
          ? 'bg-green-500/10 text-green-600 dark:text-green-400'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {connected ? 'Connected' : status === 'connecting' ? 'Connecting…' : 'Disconnected'}
    </div>
  )
}

export function CollabPanel() {
  const { status, room, localUser, joinRoom, leaveRoom, setUsers, setStatus } = useCollabStore()
  const { user } = useFirebaseUser()
  const [copied, setCopied] = useState(false)
  const [syncEnabled, setSyncEnabled] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const registeredRef = useRef(false)

  const sceneId =
    typeof window !== 'undefined' ? getSceneIdFromPath(window.location.pathname) : null

  const { status: syncStatus } = useCollabSession({
    sceneId: sceneId ?? '',
    enabled: syncEnabled && !!sceneId && !!user,
    userId: user?.uid,
    userName: user?.displayName ?? user?.email?.split('@')[0],
  })

  useEffect(() => {
    if (!sceneId || !user) return
    if (registeredRef.current) return

    const color = hashColor(user.uid)
    const name = user.displayName ?? user.email?.split('@')[0] ?? 'Anonymous'
    const roomUser: CollabUser = { id: user.uid, name, color, lastSeen: Date.now() }

    setStatus('connecting')

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

    intervalRef.current = setInterval(() => {
      fetch('/api/collab/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: sceneId, userId: user.uid, name, color }),
      }).catch(() => {})

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

  function copySceneUrl() {
    if (typeof window === 'undefined') return
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const users = room?.users ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Collaboration</h2>
        <StatusBadge status={status} />
      </div>

      {/* Who's here */}
      <section>
        <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Who&apos;s here
        </p>
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {sceneId ? 'Only you right now.' : 'Open a cloud scene to see collaborators.'}
          </p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border px-3">
            {users.map((u) => (
              <UserRow key={u.id} user={u} isLocal={u.id === localUser?.id} />
            ))}
          </div>
        )}
      </section>

      {/* Invite */}
      {sceneId && (
        <section>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Invite
          </p>
          <button
            type="button"
            onClick={copySceneUrl}
            className="flex w-full items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 shrink-0 text-green-500" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="flex-1 truncate text-left">
              {copied ? 'Link copied!' : 'Copy scene link'}
            </span>
          </button>
        </section>
      )}

      {/* Real-time sync */}
      {sceneId && (
        <section>
          <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Real-time sync
          </p>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  syncStatus === 'connected'
                    ? 'bg-green-500'
                    : syncStatus === 'connecting'
                    ? 'bg-yellow-400 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-destructive'
                    : 'bg-muted-foreground/40'
                }`}
              />
              <span className="text-sm text-foreground">
                {syncStatus === 'connected'
                  ? 'Live sync active'
                  : syncStatus === 'connecting'
                  ? 'Connecting…'
                  : syncStatus === 'error'
                  ? 'Sync error'
                  : 'Live sync off'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSyncEnabled((v) => !v)}
              className={`relative h-5 w-9 rounded-full transition-colors ${
                syncEnabled ? 'bg-brand' : 'bg-muted'
              }`}
              aria-label="Toggle live sync"
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  syncEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Enable to sync edits in real time with other collaborators.
          </p>
        </section>
      )}
    </div>
  )
}
