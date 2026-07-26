'use client'

import { Pencil, Trash2, Check, X, Share2, UserPlus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface SceneCardProps {
  id: string
  name: string
  nodeCount: number
  updatedAt: string
  thumbnailUrl: string | null
  canShare?: boolean
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

type Collaborator = { id: string; email: string | null; role: string }

function ShareDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer')
  const [collabs, setCollabs] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(true)
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useState(() => {
    void fetch(`/api/scenes/${id}/collaborators`)
      .then((r) => r.json())
      .then((data: Collaborator[]) => { setCollabs(data); setLoading(false) })
      .catch(() => setLoading(false))
  })

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setInviting(true)
    setError(null)
    const res = await fetch(`/api/scenes/${id}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), role }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error === 'already_invited' ? 'Already invited.' : data.error === 'pro_required' ? 'Pro plan required.' : 'Failed to invite.')
    } else {
      setCollabs((prev) => [...prev, data as Collaborator])
      setEmail('')
    }
    setInviting(false)
  }

  async function removeCollab(collabId: string) {
    await fetch(`/api/scenes/${id}/collaborators?collaboratorId=${collabId}`, { method: 'DELETE' })
    setCollabs((prev) => prev.filter((c) => c.id !== collabId))
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-brand" />
            <h3 className="font-semibold text-sm">Share scene</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <form onSubmit={(e) => void invite(e)} className="flex gap-2">
            <input
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <select
              className="rounded-lg border border-border bg-background px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={role}
              onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <button
              type="submit"
              disabled={inviting || !email.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
              Invite
            </button>
          </form>
          {error && <p className="text-destructive text-xs">{error}</p>}
          {loading ? (
            <p className="text-muted-foreground text-xs">Loading…</p>
          ) : collabs.length === 0 ? (
            <p className="text-muted-foreground text-xs">No collaborators yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {collabs.map((c) => (
                <li key={c.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span className="truncate text-foreground">{c.email ?? 'Unknown'}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-muted-foreground text-xs capitalize">{c.role}</span>
                    <button
                      type="button"
                      onClick={() => void removeCollab(c.id)}
                      className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function SceneCard({ id, name, nodeCount, updatedAt, thumbnailUrl, canShare }: SceneCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [displayName, setDisplayName] = useState(name)
  const [deleting, setDeleting] = useState(false)
  const [sharing, setSharing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const startEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditName(displayName)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const cancelEdit = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    setEditing(false)
  }

  const saveEdit = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    const trimmed = editName.trim()
    if (!trimmed || trimmed === displayName) {
      setEditing(false)
      return
    }
    try {
      const res = await fetch(`/api/scenes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      if (res.ok) setDisplayName(trimmed)
    } catch {
      // ignore — keep old name displayed
    }
    setEditing(false)
  }

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Delete "${displayName}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await fetch(`/api/scenes/${id}`, { method: 'DELETE' })
      router.refresh()
    } catch {
      setDeleting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  return (
    <li className="group relative rounded-xl border border-border/60 bg-background transition-all duration-150 hover:border-border hover:shadow-md">
      {sharing && <ShareDialog id={id} onClose={() => setSharing(false)} />}
      <Link className="block p-4" href={`/scene/${id}`}>
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={displayName} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" src={thumbnailUrl} />
          ) : (
            <span className="text-muted-foreground text-xs">No thumbnail</span>
          )}
        </div>
        <div className="mt-3">
          {editing ? (
            <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
              <input
                ref={inputRef}
                autoFocus
                className="min-w-0 flex-1 rounded border border-border bg-background px-1.5 py-0.5 font-semibold text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="rounded p-0.5 text-success hover:bg-success-muted"
                onClick={(e) => void saveEdit(e)}
                type="button"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded p-0.5 text-muted-foreground hover:bg-accent"
                onClick={cancelEdit}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <h2 className="min-w-0 flex-1 truncate font-semibold text-sm">{displayName}</h2>
              <button
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
                onClick={startEdit}
                title="Rename"
                type="button"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {canShare && (
                <button
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-brand-muted hover:text-brand group-hover:opacity-100"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSharing(true) }}
                  title="Share"
                  type="button"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                disabled={deleting}
                onClick={(e) => void handleDeleteClick(e)}
                title="Delete"
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between text-muted-foreground text-xs">
            <span>{nodeCount} nodes</span>
            <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
          </div>
        </div>
      </Link>
    </li>
  )
}

