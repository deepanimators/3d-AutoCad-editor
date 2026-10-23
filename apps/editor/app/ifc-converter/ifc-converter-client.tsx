'use client'

import { useState, useRef } from 'react'
import { FileCode2, Upload, ArrowRight, CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  { label: 'Geometry preservation', detail: 'Walls, slabs, columns, beams, roofs converted to native Aruct nodes' },
  { label: 'Storey structure', detail: 'Building storeys mapped to Aruct levels automatically' },
  { label: 'IFC metadata', detail: 'Properties, classifications, and custom psets attached to each node' },
  { label: 'Material mapping', detail: 'IFC materials matched to Aruct material library' },
]

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export function IFCConverterClient() {
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [sceneId, setSceneId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.ifc')) {
      setError('Only .ifc files are supported.')
      setState('error')
      return
    }
    setFileName(file.name)
    setState('uploading')
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/import/ifc', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `Upload failed (${res.status})`)
      }
      const data = await res.json()
      setSceneId(data.sceneId ?? null)
      setState('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/40 px-6 py-12 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10">
            <FileCode2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">IFC Converter</h1>
          <p className="mt-3 text-base text-muted-foreground">
            Import Industry Foundation Classes (IFC) files into Aruct. Geometry, storeys, and metadata
            preserved — ready to edit immediately.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 space-y-10">
        {/* Drop zone */}
        {state === 'idle' || state === 'error' ? (
          <div
            className={cn(
              'relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-16 text-center transition-colors cursor-pointer',
              dragging
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-border hover:border-border/80 hover:bg-muted/30'
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".ifc"
              className="sr-only"
              onChange={onInputChange}
            />
            <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-semibold text-foreground">Drop your IFC file here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click to browse — .ifc files only</p>
            {state === 'error' && error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        ) : state === 'uploading' ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-muted/20 px-8 py-16 text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-muted-foreground" />
            <p className="font-semibold text-foreground">Importing {fileName}…</p>
            <p className="mt-1 text-sm text-muted-foreground">Parsing geometry and metadata</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-8 py-16 text-center">
            <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" />
            <p className="font-semibold text-foreground">Import complete — {fileName}</p>
            <p className="mt-1 text-sm text-muted-foreground">Scene created. Open it in the editor to continue.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {sceneId ? (
                <a
                  href={`/scene/${sceneId}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
                >
                  Open scene
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <a
                  href="/scenes"
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
                >
                  Go to scenes
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
              <button
                type="button"
                onClick={() => { setState('idle'); setSceneId(null); setFileName(null) }}
                className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                Import another
              </button>
            </div>
          </div>
        )}

        {/* Info banner */}
        <div className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p>
            IFC import is in beta. Complex models with thousands of elements may take up to a minute to
            process. Supported schema versions: IFC2x3, IFC4, IFC4x3.
          </p>
        </div>

        {/* Features */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What gets converted
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{f.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open editor CTA */}
        <div className="rounded-xl border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-foreground">Prefer to import inside the editor?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use <strong>File → Import IFC</strong> inside the Aruct Editor to import directly into an existing scene.
            </p>
          </div>
          <a
            href="/editor"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Open Editor
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
