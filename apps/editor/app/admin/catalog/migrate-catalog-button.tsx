'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

type MigrateResult = {
  dryRun: boolean
  scenesScanned: number
  scenesUpdated: number
  sceneUrlsFixed: number
  modelsUpdated: number
}

export function MigrateCatalogButton() {
  const [status, setStatus] = useState<'idle' | 'preview' | 'running' | 'done'>('idle')
  const [result, setResult] = useState<MigrateResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run(dryRun: boolean) {
    setStatus(dryRun ? 'preview' : 'running')
    setError(null)
    try {
      const url = `/api/admin/migrate/polyhaven-urls${dryRun ? '?dry_run=true' : ''}`
      const res = await fetch(url, { method: 'POST' })
      const data = (await res.json()) as MigrateResult & { error?: string }
      if (!res.ok) { setError(data.error ?? 'Migration failed'); return }
      setResult(data)
      setStatus('done')
    } catch {
      setError('Network error')
      setStatus('idle')
    }
  }

  if (status === 'done' && result) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {result.dryRun
            ? `Preview: ${result.scenesUpdated} scenes, ${result.sceneUrlsFixed} URLs, ${result.modelsUpdated} models`
            : `Done: ${result.scenesUpdated} scenes fixed`}
        </span>
        {result.dryRun && (
          <button
            type="button"
            onClick={() => void run(false)}
            className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-1.5 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors"
          >
            Apply migration
          </button>
        )}
        <button
          type="button"
          onClick={() => { setStatus('idle'); setResult(null) }}
          className="text-xs text-muted-foreground underline"
        >
          Reset
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-destructive">{error}</span>}
      <button
        type="button"
        disabled={status !== 'idle'}
        onClick={() => void run(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${status !== 'idle' ? 'animate-spin' : ''}`} />
        Fix Poly Haven URLs
      </button>
    </div>
  )
}
