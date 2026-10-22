'use client'

import { type AnyNode, type AnyNodeId, useScene } from '@aruct/core'
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  DoorOpen,
  Layers,
  LoaderCircle,
  Square,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

// Shape returned by /api/import/ifc
type ImportPreview = {
  walls: number
  floors: number
  doors: number
  windows: number
  columns: number
  stairs: number
  roofs: number
  levels: number
  buildings: number
  total: number
}

type ImportResult = {
  nodes: Record<string, unknown>
  rootNodeIds: string[]
  preview: ImportPreview
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'uploading'; percent: number }
  | { kind: 'preview'; result: ImportResult }
  | { kind: 'error'; message: string }
  | { kind: 'done' }

type Props = {
  open: boolean
  onClose: () => void
}

function PreviewRow({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) {
  if (count === 0) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground w-4 shrink-0">{icon}</span>
      <span className="flex-1 text-foreground">{label}</span>
      <span className="font-medium tabular-nums">{count}</span>
    </div>
  )
}

export function IfcImportDialog({ open, onClose }: Props) {
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
    if (!file.name.toLowerCase().endsWith('.ifc') && !file.name.toLowerCase().endsWith('.ifczip')) {
      setPhase({ kind: 'error', message: 'Only .ifc files are supported.' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhrRef.current = xhr

    setPhase({ kind: 'uploading', percent: 0 })

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setPhase({ kind: 'uploading', percent: Math.round((e.loaded / e.total) * 100) })
      }
    })

    xhr.addEventListener('load', () => {
      xhrRef.current = null
      if (xhr.status === 403) {
        setPhase({ kind: 'error', message: 'Pro plan required to import IFC files.' })
        return
      }
      if (xhr.status === 415) {
        setPhase({ kind: 'error', message: 'Only .ifc files are supported.' })
        return
      }
      if (xhr.status === 413) {
        setPhase({ kind: 'error', message: 'File exceeds the 200 MB size limit.' })
        return
      }
      if (xhr.status !== 200) {
        let detail = `Server returned ${xhr.status}.`
        try {
          const body = JSON.parse(xhr.responseText) as { error?: string; detail?: string }
          detail = body.error ?? body.detail ?? detail
        } catch {
          /* non-JSON error body */
        }
        setPhase({ kind: 'error', message: detail })
        return
      }
      try {
        const result = JSON.parse(xhr.responseText) as ImportResult
        setPhase({ kind: 'preview', result })
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

    xhr.open('POST', '/api/import/ifc')
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
    const { nodes, rootNodeIds } = phase.result

    // Map the flat node dictionary into createNodes ops. Nodes whose parent is
    // also in the imported graph are already linked via parentId — createNodes
    // handles the tree wiring. Nodes with no parentId, or whose parentId is not
    // in the imported set, become top-level entries in the current scene.
    const ops = (rootNodeIds as string[]).flatMap((id) => collectSubtree(nodes, id))

    createNodes(ops as { node: AnyNode; parentId?: AnyNodeId }[])
    setPhase({ kind: 'done' })
  }, [phase, createNodes])

  if (!open) return null

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
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base">Import IFC</h2>
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
        <div className="p-5 space-y-4">
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
                  <p className="text-sm font-medium text-foreground">Drop an IFC file here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                </div>
                <p className="text-xs text-muted-foreground">.ifc — up to 200 MB</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".ifc,.ifczip"
                  className="sr-only"
                  onChange={handleFileInput}
                />
              </div>

              {/* Error message */}
              {phase.kind === 'error' && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{phase.message}</span>
                </div>
              )}
            </>
          )}

          {phase.kind === 'uploading' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <LoaderCircle className="w-8 h-8 text-primary animate-spin" />
              <div className="w-full space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading and parsing IFC…</span>
                  <span>{phase.percent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${phase.percent}%` }}
                  />
                </div>
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
              <p className="text-sm text-muted-foreground">
                Parsed successfully. Review what will be added to your scene:
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <PreviewRow label="Walls" count={phase.result.preview.walls} icon={<Square className="w-3.5 h-3.5" />} />
                <PreviewRow label="Floors / Slabs" count={phase.result.preview.floors} icon={<Layers className="w-3.5 h-3.5" />} />
                <PreviewRow label="Doors" count={phase.result.preview.doors} icon={<DoorOpen className="w-3.5 h-3.5" />} />
                <PreviewRow label="Windows" count={phase.result.preview.windows} icon={<Square className="w-3.5 h-3.5" />} />
                <PreviewRow label="Columns" count={phase.result.preview.columns} icon={<Square className="w-3.5 h-3.5" />} />
                <PreviewRow label="Stairs" count={phase.result.preview.stairs} icon={<Layers className="w-3.5 h-3.5" />} />
                <PreviewRow label="Roofs" count={phase.result.preview.roofs} icon={<Square className="w-3.5 h-3.5" />} />
                <PreviewRow label="Levels" count={phase.result.preview.levels} icon={<Layers className="w-3.5 h-3.5" />} />
                <div className="border-t border-border pt-2 flex items-center justify-between text-sm font-medium">
                  <span>Total nodes</span>
                  <span>{phase.result.preview.total}</span>
                </div>
              </div>
            </div>
          )}

          {phase.kind === 'done' && (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
              <p className="font-medium text-foreground">Import complete</p>
              <p className="text-sm text-muted-foreground">
                The IFC elements have been added to your scene.
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
                <button
                  onClick={importToScene}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Import to scene
                </button>
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

// Collect a root node and all descendants from the flat node map into
// createNodes ops. Children are collected in depth-first order so that
// parents are always created before their children.
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
      for (const childId of children) {
        walk(childId, id)
      }
    }
  }

  walk(rootId)
  return result
}
