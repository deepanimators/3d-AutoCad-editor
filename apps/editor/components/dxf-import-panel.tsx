'use client'

import { useScene } from '@aruct/core'
import { FileCode, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

type ImportStats = { lines: number; polylines: number; inserts: number; skipped: number }

type ImportedWall = {
  object: 'node'; id: string; type: 'wall'; parentId: null; visible: boolean
  start: [number, number]; end: [number, number]
}
type ImportedSlab = {
  object: 'node'; id: string; type: 'slab'; parentId: null; visible: boolean
  polygon: [number, number][]; elevation: number; thickness: number
}
type ImportedNode = ImportedWall | ImportedSlab

export function DxfImportPanel() {
  const createNode = useScene((s) => s.createNode)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [stats, setStats] = useState<ImportStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [wallCount, setWallCount] = useState(0)
  const [slabCount, setSlabCount] = useState(0)

  const doImport = async (file: File) => {
    setStatus('loading')
    setError(null)
    setStats(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/import/dxf', { method: 'POST', body: fd })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      const data = (await res.json()) as { nodes: ImportedNode[]; stats: ImportStats }
      let walls = 0
      let slabs = 0
      for (const node of data.nodes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createNode(node as any)
        if (node.type === 'wall') walls++
        else if (node.type === 'slab') slabs++
      }
      setWallCount(walls)
      setSlabCount(slabs)
      setStats(data.stats)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStatus('error')
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    void doImport(files[0])
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <FileCode className="h-4 w-4 text-sidebar-foreground/60" />
        <h2 className="text-sm font-semibold text-sidebar-foreground">DXF / DWG Import</h2>
      </div>

      <div className="flex flex-col gap-4 p-4">
        {/* Drop zone */}
        <button
          type="button"
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? 'border-primary bg-primary/5'
              : 'border-border/60 hover:border-border hover:bg-accent/10'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <Upload className="h-6 w-6 text-sidebar-foreground/40" />
          <p className="text-sm font-medium text-sidebar-foreground">Drop a .dxf file here</p>
          <p className="text-xs text-sidebar-foreground/50">or click to browse</p>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".dxf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Status */}
        {status === 'loading' && (
          <p className="text-center text-xs text-sidebar-foreground/60">Importing…</p>
        )}

        {status === 'error' && error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {status === 'done' && stats && (
          <div className="rounded-xl border border-border/60 bg-accent/10 px-3 py-3 text-xs text-sidebar-foreground">
            <p className="mb-1 font-semibold">Import complete</p>
            <ul className="space-y-0.5 text-sidebar-foreground/70">
              <li>Walls created: {wallCount}</li>
              <li>Slabs created: {slabCount}</li>
              {stats.inserts > 0 && (
                <li className="text-sidebar-foreground/50">
                  Skipped {stats.inserts} block INSERT(s) — catalog lookup not implemented
                </li>
              )}
              {stats.skipped > 0 && (
                <li className="text-sidebar-foreground/50">
                  Skipped {stats.skipped} unsupported entities
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-border/60 px-3 py-3 text-xs text-sidebar-foreground/60">
          <p className="font-medium text-sidebar-foreground/80">Supported entities</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            <li>LINE → wall segment</li>
            <li>LWPOLYLINE (open) → wall segments</li>
            <li>LWPOLYLINE (closed) → slab outline</li>
          </ul>
          <p className="mt-2 text-sidebar-foreground/50">
            DWG binary import coming in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
