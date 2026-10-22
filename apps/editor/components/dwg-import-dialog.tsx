'use client'

import { type AnyNode, type AnyNodeId, useScene } from '@aruct/core'
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileCode,
  Info,
  Layers,
  LoaderCircle,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// ─── Types matching /api/import/dwg response ──────────────────────────────────

type DwgLayer = { name: string; color: number; frozen: boolean }

type DwgImportResponse = {
  version: string
  units: 'metric' | 'imperial'
  layers: DwgLayer[]
  entityCount: number
  extMin: { x: number; y: number }
  extMax: { x: number; y: number }
  warnings: string[]
  sceneFragment: {
    nodes: Record<string, unknown>
    rootNodeIds: string[]
  }
}

// ─── State machine ────────────────────────────────────────────────────────────

type Phase =
  | { kind: 'idle' }
  | { kind: 'uploading'; percent: number; fileName: string }
  | { kind: 'preview'; data: DwgImportResponse }
  | { kind: 'error'; message: string }
  | { kind: 'done' }

// ─── Sub-components ───────────────────────────────────────────────────────────

function WarningBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="leading-relaxed">{message}</span>
    </div>
  )
}

function ConversionTip() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-3 py-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
        For full entity import (walls, polylines, arcs)
      </div>
      <ol className="text-xs text-muted-foreground space-y-1 ml-5 list-decimal">
        <li>
          Open your .dwg in{' '}
          <a
            href="https://librecad.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            LibreCAD
            <ExternalLink className="w-2.5 h-2.5" />
          </a>{' '}
          (free &amp; open-source)
        </li>
        <li>File → Export → DXF R2010</li>
        <li>Import the .dxf file into Aruct</li>
      </ol>
    </div>
  )
}

function LayerList({ layers }: { layers: DwgLayer[] }) {
  if (layers.length === 0) return null
  const shown = layers.slice(0, 8)
  const rest = layers.length - shown.length
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
        <Layers className="w-3.5 h-3.5" />
        Layers ({layers.length})
      </div>
      {shown.map((layer) => (
        <div key={layer.name} className="flex items-center gap-2 text-xs">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 border border-border"
            style={{ backgroundColor: dwgColorToHex(layer.color) }}
          />
          <span className="text-foreground truncate flex-1">{layer.name}</span>
          {layer.frozen && (
            <span className="text-muted-foreground text-[10px]">frozen</span>
          )}
        </div>
      ))}
      {rest > 0 && (
        <p className="text-[10px] text-muted-foreground pt-1">
          +{rest} more layers
        </p>
      )}
    </div>
  )
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

type Props = {
  open: boolean
  onClose: () => void
}

export function DwgImportDialog({ open, onClose }: Props) {
  const createNodes = useScene((s) => s.createNodes)
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const reset = useCallback(() => {
    xhrRef.current?.abort()
    xhrRef.current = null
    setPhase({ kind: 'idle' })
    setIsDragging(false)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const uploadFile = useCallback((file: File) => {
    const nameLower = file.name.toLowerCase()
    if (!nameLower.endsWith('.dwg') && !nameLower.endsWith('.dxf')) {
      setPhase({ kind: 'error', message: 'Only .dwg and .dxf files are supported.' })
      return
    }

    // DXF files should go to the DXF endpoint
    if (nameLower.endsWith('.dxf')) {
      setPhase({
        kind: 'error',
        message: 'This is a DXF file. Please use the DXF import option instead.',
      })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    setPhase({ kind: 'uploading', percent: 0, fileName: file.name })

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setPhase({ kind: 'uploading', percent: Math.round((e.loaded / e.total) * 100), fileName: file.name })
      }
    })

    xhr.addEventListener('load', () => {
      xhrRef.current = null

      if (xhr.status === 401) {
        setPhase({ kind: 'error', message: 'You must be signed in to import files.' })
        return
      }
      if (xhr.status === 403) {
        setPhase({ kind: 'error', message: 'DWG import requires a Pro plan. Upgrade to continue.' })
        return
      }
      if (xhr.status === 413) {
        setPhase({ kind: 'error', message: 'File exceeds the 50 MB size limit.' })
        return
      }
      if (xhr.status === 415) {
        let detail = 'Unsupported DWG version.'
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string }
          detail = body.error ?? detail
        } catch { /* non-JSON */ }
        setPhase({ kind: 'error', message: detail })
        return
      }
      if (xhr.status !== 200) {
        let detail = `Server returned ${xhr.status}.`
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string }
          detail = body.error ?? detail
        } catch { /* non-JSON */ }
        setPhase({ kind: 'error', message: detail })
        return
      }

      try {
        const data = JSON.parse(xhr.responseText) as DwgImportResponse
        setPhase({ kind: 'preview', data })
      } catch {
        setPhase({ kind: 'error', message: 'Server returned an unexpected response.' })
      }
    })

    xhr.addEventListener('error', () => {
      xhrRef.current = null
      setPhase({ kind: 'error', message: 'Upload failed. Check your network connection.' })
    })

    xhr.addEventListener('abort', () => {
      xhrRef.current = null
    })

    xhr.open('POST', '/api/import/dwg')
    xhr.send(formData)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) uploadFile(file)
    },
    [uploadFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) uploadFile(file)
    },
    [uploadFile],
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const importToScene = useCallback(() => {
    if (phase.kind !== 'preview') return
    const { nodes, rootNodeIds } = phase.data.sceneFragment

    const ops = (rootNodeIds as string[]).flatMap((id) => collectSubtree(nodes, id))
    createNodes(ops as { node: AnyNode; parentId?: AnyNodeId }[])
    setPhase({ kind: 'done' })
  }, [phase, createNodes])

  if (!open) return null

  const isCompatibilityMode =
    phase.kind === 'preview' && phase.data.sceneFragment.rootNodeIds.length === 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base">Import DWG</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {(phase.kind === 'idle' || phase.kind === 'error') && (
            <>
              {/* Drop zone */}
              <div
                className={[
                  'relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors cursor-pointer',
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50',
                ].join(' ')}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop a DWG file here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground">.dwg — up to 50 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".dwg"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </div>

              {/* Error */}
              {phase.kind === 'error' && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{phase.message}</span>
                </div>
              )}

              <ConversionTip />
            </>
          )}

          {phase.kind === 'uploading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <LoaderCircle className="w-8 h-8 text-primary animate-spin" />
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="truncate max-w-[70%]">{phase.fileName}</span>
                  <span>{phase.percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${phase.percent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">Uploading and parsing DWG…</p>
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-foreground underline"
                onClick={reset}
              >
                Cancel
              </button>
            </div>
          )}

          {phase.kind === 'preview' && (
            <div className="space-y-4">
              {/* File info */}
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                <FileCode className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    DWG {phase.data.version}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {phase.data.units === 'imperial' ? 'Imperial units' : 'Metric units'} ·{' '}
                    {phase.data.layers.length} layer{phase.data.layers.length !== 1 ? 's' : ''}
                    {phase.data.entityCount > 0 && ` · ${phase.data.entityCount} entities`}
                  </p>
                </div>
              </div>

              {/* Warnings */}
              {phase.data.warnings.map((w, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static list from parse result
                <WarningBanner key={i} message={w} />
              ))}

              {/* Compatibility mode tip */}
              {isCompatibilityMode && <ConversionTip />}

              {/* Layer list */}
              <LayerList layers={phase.data.layers} />

              {/* Entity count (if any decoded) */}
              {phase.data.entityCount > 0 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm">
                  <span className="text-muted-foreground">Entities decoded</span>
                  <span className="font-medium tabular-nums">{phase.data.entityCount}</span>
                </div>
              )}
            </div>
          )}

          {phase.kind === 'done' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="font-medium text-foreground">Import complete</p>
              <p className="text-sm text-muted-foreground">
                The DWG elements have been added to your scene.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(phase.kind === 'preview' || phase.kind === 'done') && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border">
            {phase.kind === 'preview' && (
              <>
                <button
                  onClick={reset}
                  className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                >
                  Back
                </button>
                {isCompatibilityMode ? (
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Close
                  </button>
                ) : (
                  <button
                    onClick={importToScene}
                    className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Import to scene
                  </button>
                )}
              </>
            )}
            {phase.kind === 'done' && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * AutoCAD Color Index (ACI) → approximate hex.
 * Only common values; others fall back to gray.
 */
function dwgColorToHex(aci: number): string {
  const map: Record<number, string> = {
    1: '#ff0000', // red
    2: '#ffff00', // yellow
    3: '#00ff00', // green
    4: '#00ffff', // cyan
    5: '#0000ff', // blue
    6: '#ff00ff', // magenta
    7: '#ffffff', // white / black
    8: '#808080', // dark gray
    9: '#c0c0c0', // light gray
  }
  return map[aci] ?? '#888888'
}

/**
 * Collect a root node and all descendants from the flat node map into
 * createNodes ops. Parents are always before children.
 */
function collectSubtree(
  nodes: Record<string, unknown>,
  rootId: string,
): { node: AnyNode; parentId?: string }[] {
  const result: { node: AnyNode; parentId?: string }[] = []

  function walk(id: string, parentId?: string) {
    const raw = nodes[id]
    if (!raw) return
    result.push({ node: raw as AnyNode, parentId })
    const children = (raw as { children?: string[] }).children
    if (Array.isArray(children)) {
      for (const childId of children) walk(childId, id)
    }
  }

  walk(rootId)
  return result
}
