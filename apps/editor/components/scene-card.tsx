'use client'

import { Pencil, Trash2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'

interface SceneCardProps {
  id: string
  name: string
  nodeCount: number
  updatedAt: string
  thumbnailUrl: string | null
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

export function SceneCard({ id, name, nodeCount, updatedAt, thumbnailUrl }: SceneCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState(name)
  const [displayName, setDisplayName] = useState(name)
  const [deleting, setDeleting] = useState(false)
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
