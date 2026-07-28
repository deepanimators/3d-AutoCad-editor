'use client'

import { useEffect, useState } from 'react'

type VersionEntry = {
  eventId: number
  version: number
  kind: string
  createdAt: string
}

interface VersionHistoryPanelProps {
  sceneId?: string
}

export function VersionHistoryPanel({ sceneId }: VersionHistoryPanelProps) {
  const [history, setHistory] = useState<VersionEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sceneId) return
    setLoading(true)
    setError(null)
    fetch(`/api/scenes/${sceneId}/history`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<{ entries: VersionEntry[] }>
      })
      .then((data) => setHistory(data.entries ?? []))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [sceneId])

  const handleRestore = async (entry: VersionEntry) => {
    if (!sceneId) return
    if (!window.confirm(`Restore to version ${entry.version}? Unsaved changes will be lost.`)) return
    const res = await fetch(`/api/scenes/${sceneId}/history/${entry.eventId}/restore`, {
      method: 'POST',
    })
    if (res.ok) {
      window.location.reload()
    } else {
      alert('Restore failed.')
    }
  }

  if (!sceneId) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-sm text-sidebar-foreground/50">Save your scene to the cloud to view version history.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Version History</h2>
        {history.length > 0 && (
          <span className="text-xs text-sidebar-foreground/50">{history.length} saved</span>
        )}
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-sidebar-foreground/50">Loading...</p>
        </div>
      )}

      {error && (
        <div className="p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && history.length === 0 && (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">No version history yet. History is recorded automatically as you save.</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="flex flex-col divide-y divide-border/40">
          {history.map((entry) => (
            <div
              key={entry.eventId}
              className="flex items-center justify-between gap-2 px-4 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-sidebar-foreground">
                  Version {entry.version}
                </p>
                <p className="truncate text-[10px] text-sidebar-foreground/50">
                  {new Date(entry.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {entry.kind !== 'save' ? ` · ${entry.kind}` : ''}
                </p>
              </div>
              <button
                className="shrink-0 rounded-md border border-border/60 bg-accent/20 px-2.5 py-1 text-[11px] font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
                onClick={() => void handleRestore(entry)}
                type="button"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
