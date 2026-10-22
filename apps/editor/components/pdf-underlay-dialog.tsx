'use client'
/**
 * PDF Underlay Import Dialog
 *
 * Two-step flow:
 *   1. Upload — user drops / picks a PDF; we send it to the API to get page
 *      count + dimensions, then rasterise the selected page client-side with
 *      pdfjs-dist.
 *   2. Calibrate — user clicks two reference points on the preview image and
 *      enters the real distance between them so we can derive meters-per-pixel.
 *      Then they set opacity and press "Add to Scene".
 */

import type { PdfUnderlayNode } from '@aruct/core'
import { generateId, useScene } from '@aruct/core'
import { FileImage, Ruler, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PageInfo = { width: number; height: number } // in PDF points

type ApiResponse = { pageCount: number; pages: PageInfo[] }

type CalibPoint = { x: number; y: number } // relative 0–1 within the preview image

type Phase =
  | { kind: 'idle' }
  | { kind: 'uploading' }
  | { kind: 'rendering'; pageIndex: number; pageCount: number; pages: PageInfo[]; file: File }
  | { kind: 'calibrate'; imageUrl: string; imageWidthPt: number; imageHeightPt: number }
  | { kind: 'error'; message: string }

type Props = {
  open: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rasterise one PDF page client-side using pdfjs-dist. Returns a blob URL. */
async function rasterisePage(
  file: File,
  pageIndex: number,
  scale: number,
): Promise<string> {
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist')
  // Point the worker at the bundled worker file (served by Next.js static assets)
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url,
    ).href
  }

  const buffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  const page = await pdf.getPage(pageIndex)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas 2D context')

  await page.render({ canvasContext: ctx, viewport }).promise

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) { reject(new Error('Canvas toBlob failed')); return }
      resolve(URL.createObjectURL(blob))
    }, 'image/png')
  })
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PdfUnderlayDialog({ open, onClose }: Props) {
  const createNodes = useScene((s) => s.createNodes)

  const [phase, setPhase] = useState<Phase>({ kind: 'idle' })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedPage, setSelectedPage] = useState(1)
  const [calibPoints, setCalibPoints] = useState<CalibPoint[]>([])
  const [realDistance, setRealDistance] = useState('')
  const [opacity, setOpacity] = useState(0.5)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cleanup blob URLs when the dialog closes or phase changes away
  const blobUrlRef = useRef<string | null>(null)
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [])

  const reset = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
    setPhase({ kind: 'idle' })
    setIsDragging(false)
    setSelectedPage(1)
    setCalibPoints([])
    setRealDistance('')
    setOpacity(0.5)
    if (inputRef.current) inputRef.current.value = ''
  }, [])

  const handleClose = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  // Step 1a: Send PDF to API for metadata, then rasterise client-side
  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPhase({ kind: 'error', message: 'Only PDF files are supported.' })
      return
    }

    setPhase({ kind: 'uploading' })

    // Get page metadata from the server
    const form = new FormData()
    form.append('file', file)
    let meta: ApiResponse
    try {
      const res = await fetch('/api/import/pdf-underlay', { method: 'POST', body: form })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Server error ${res.status}`)
      }
      meta = await res.json() as ApiResponse
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Upload failed.',
      })
      return
    }

    // Rasterise page 1 by default
    setPhase({
      kind: 'rendering',
      pageIndex: selectedPage,
      pageCount: meta.pageCount,
      pages: meta.pages,
      file,
    })

    try {
      const url = await rasterisePage(file, selectedPage, 2)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = url
      const pg = meta.pages[selectedPage - 1]
      setCalibPoints([])
      setPhase({
        kind: 'calibrate',
        imageUrl: url,
        imageWidthPt: pg.width,
        imageHeightPt: pg.height,
      })
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not render PDF page.',
      })
    }
  }, [selectedPage])

  // Re-render when user changes the page selector (only available in rendering phase)
  const rerenderPage = useCallback(async (file: File, pages: PageInfo[], pageIndex: number) => {
    setPhase({ kind: 'rendering', pageIndex, pageCount: pages.length, pages, file })
    try {
      const url = await rasterisePage(file, pageIndex, 2)
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = url
      const pg = pages[pageIndex - 1]
      setCalibPoints([])
      setPhase({
        kind: 'calibrate',
        imageUrl: url,
        imageWidthPt: pg.width,
        imageHeightPt: pg.height,
      })
    } catch (err) {
      setPhase({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not render PDF page.',
      })
    }
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile],
  )

  // Step 2: Collect two calibration clicks on the image
  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (calibPoints.length >= 2) return
      const rect = e.currentTarget.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setCalibPoints((pts) => [...pts, { x, y }])
    },
    [calibPoints],
  )

  // Step 2 → Add to Scene
  const addToScene = useCallback(() => {
    if (phase.kind !== 'calibrate') return
    if (calibPoints.length < 2) return
    const dist = parseFloat(realDistance)
    if (!Number.isFinite(dist) || dist <= 0) return

    const { imageUrl, imageWidthPt, imageHeightPt } = phase
    const [p1, p2] = calibPoints

    // Distance between calibration points in image-relative units (0–1)
    const dx = p2.x - p1.x
    const dy = p2.y - p1.y
    const measuredFraction = Math.sqrt(dx * dx + dy * dy)

    // 1 PDF point = 1/72 inch. The image was rendered at 2× scale (144 DPI) so
    // pixel count = points × 2. The fraction we measured is relative to the
    // rendered image width, which in points = imageWidthPt.
    const measuredPt = measuredFraction * imageWidthPt
    const metersPerPt = dist / measuredPt
    const pageWidthMeters = imageWidthPt * metersPerPt
    const pageHeightMeters = imageHeightPt * metersPerPt

    const node: PdfUnderlayNode = {
      object: 'node',
      id: generateId('pdf-underlay'),
      type: 'pdf-underlay',
      imageUrl,
      pageWidthMeters,
      pageHeightMeters,
      originX: 0,
      originZ: 0,
      rotation: 0,
      opacity,
      levelId: null,
      visible: true,
      parentId: null,
      metadata: {},
    }

    createNodes([{ node }])
    handleClose()
  }, [phase, calibPoints, realDistance, opacity, createNodes, handleClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <FileImage className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-base">Import PDF Underlay</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded p-0.5"
            aria-label="Close"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── IDLE: drop zone ── */}
          {(phase.kind === 'idle' || phase.kind === 'error') && (
            <>
              <div
                className={`
                  border-2 border-dashed rounded-lg p-10 flex flex-col items-center gap-3
                  cursor-pointer transition-colors
                  ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter') inputRef.current?.click() }}
                role="button"
                tabIndex={0}
                aria-label="Drop PDF here or click to browse"
              >
                <FileImage className="w-10 h-10 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium text-sm">Drop a PDF floor plan here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse — max 50 MB</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {phase.kind === 'error' && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  {phase.message}
                </p>
              )}
            </>
          )}

          {/* ── UPLOADING / RENDERING ── */}
          {(phase.kind === 'uploading' || phase.kind === 'rendering') && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                {phase.kind === 'uploading' ? 'Reading PDF…' : `Rendering page ${phase.pageIndex}…`}
              </p>
              {phase.kind === 'rendering' && phase.pageCount > 1 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Page</span>
                  <select
                    className="bg-background border border-border rounded px-2 py-1 text-sm"
                    value={phase.pageIndex}
                    onChange={(e) => {
                      const idx = Number(e.target.value)
                      setSelectedPage(idx)
                      rerenderPage(phase.file, phase.pages, idx)
                    }}
                  >
                    {Array.from({ length: phase.pageCount }, (_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <span className="text-muted-foreground">of {phase.pageCount}</span>
                </div>
              )}
            </div>
          )}

          {/* ── CALIBRATE ── */}
          {phase.kind === 'calibrate' && (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-primary" />
                  Calibrate scale
                </p>
                <p className="text-xs text-muted-foreground">
                  Click two points on the plan whose real-world distance you know.
                  {calibPoints.length === 0 && ' Click the first point.'}
                  {calibPoints.length === 1 && ' Now click the second point.'}
                  {calibPoints.length >= 2 && ' Enter the distance below.'}
                </p>
              </div>

              {/* Preview image */}
              <div className="relative rounded-lg overflow-hidden border border-border bg-checkerboard">
                <img
                  src={phase.imageUrl}
                  alt="PDF page preview"
                  className={`w-full object-contain block ${
                    calibPoints.length < 2 ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={handleImageClick}
                  draggable={false}
                />
                {/* Calibration point markers */}
                {calibPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                    style={{
                      left: `${pt.x * 100}%`,
                      top: `${pt.y * 100}%`,
                      background: i === 0 ? '#3b82f6' : '#ef4444',
                    }}
                    aria-label={`Point ${i + 1}`}
                  />
                ))}
                {/* Line between points */}
                {calibPoints.length === 2 && (() => {
                  const [p1, p2] = calibPoints
                  const cx = ((p1.x + p2.x) / 2) * 100
                  const cy = ((p1.y + p2.y) / 2) * 100
                  const dx = (p2.x - p1.x) * 100
                  const dy = (p2.y - p1.y) * 100
                  const len = Math.sqrt(dx * dx + dy * dy)
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI)
                  return (
                    <div
                      className="absolute h-0.5 bg-yellow-400 origin-left"
                      style={{
                        left: `${p1.x * 100}%`,
                        top: `${p1.y * 100}%`,
                        width: `${len}%`,
                        transform: `rotate(${angle}deg)`,
                      }}
                    />
                  )
                })()}
              </div>

              {/* Reset calibration */}
              {calibPoints.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                  onClick={() => setCalibPoints([])}
                >
                  Reset calibration points
                </button>
              )}

              {/* Real distance input */}
              {calibPoints.length >= 2 && (
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="real-dist">
                    Real distance between points (meters)
                  </label>
                  <input
                    id="real-dist"
                    type="number"
                    min="0.001"
                    step="0.001"
                    placeholder="e.g. 5.0"
                    value={realDistance}
                    onChange={(e) => setRealDistance(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}

              {/* Opacity */}
              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="opacity-slider">
                  Opacity — {Math.round(opacity * 100)}%
                </label>
                <input
                  id="opacity-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {phase.kind === 'calibrate' && (
          <div className="px-5 py-4 border-t border-border shrink-0 flex justify-end gap-3">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={addToScene}
              disabled={
                calibPoints.length < 2 ||
                !realDistance ||
                parseFloat(realDistance) <= 0
              }
              className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add to Scene
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
