'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function IfcExportPanel() {
  const searchParams = useSearchParams()
  // The scene page is at /scene/[id]; the panel can also be used on the home page
  const sceneId =
    searchParams.get('sceneId') ??
    (typeof window !== 'undefined'
      ? window.location.pathname.match(/\/scene\/([^/]+)/)?.[1] ?? null
      : null)

  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleExport = () => {
    if (!sceneId) return
    setStatus('loading')
    setErrorMessage('')

    const url = `/api/export/ifc?sceneId=${encodeURIComponent(sceneId)}`

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data: { error?: string }) => {
            throw new Error(data.error ?? `HTTP ${res.status}`)
          })
        }
        return res.blob()
      })
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob as Blob)
        const a = document.createElement('a')
        a.href = objectUrl
        a.download = 'scene.ifc'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(objectUrl)
        setStatus('idle')
      })
      .catch((err: unknown) => {
        setErrorMessage(err instanceof Error ? err.message : 'Export failed')
        setStatus('error')
      })
  }

  return (
    <div className="space-y-3 p-4">
      <div>
        <h3 className="text-sm font-semibold">IFC / BIM Export</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Export your scene to IFC 2x3 format for use in Revit, ArchiCAD, and other BIM tools.
        </p>
      </div>

      {!sceneId ? (
        <p className="text-xs text-muted-foreground">
          Save your scene first to enable IFC export.
        </p>
      ) : (
        <button
          className="w-full rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          disabled={status === 'loading'}
          onClick={handleExport}
          type="button"
        >
          {status === 'loading' ? 'Exporting...' : 'Export IFC'}
        </button>
      )}

      {status === 'error' && (
        <p className="text-xs text-destructive">{errorMessage}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Exported file includes walls, doors, windows, slabs, and roofs.
      </p>
    </div>
  )
}
