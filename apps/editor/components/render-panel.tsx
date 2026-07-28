'use client'

import { Camera } from 'lucide-react'
import { useEffect, useState } from 'react'
import { captureViewerRender } from '@/lib/render/offline-render'

type Resolution = '1k' | '2k' | '4k'
type Quality = 'draft' | 'standard' | 'high'

const RESOLUTIONS: Record<Resolution, { w: number; h: number; label: string }> = {
  '1k': { w: 1024, h: 768, label: '1K (1024×768)' },
  '2k': { w: 2048, h: 1536, label: '2K (2048×1536)' },
  '4k': { w: 4096, h: 3072, label: '4K (4096×3072)' },
}

// Quality maps to a brief delay that lets the renderer settle after DPR change.
// Higher quality triggers more post-processing frames before capture.
const QUALITY_SETTLE_MS: Record<Quality, number> = {
  draft: 0,
  standard: 200,
  high: 500,
}

export function RenderPanel() {
  const [resolution, setResolution] = useState<Resolution>('2k')
  const [quality, setQuality] = useState<Quality>('standard')
  const [status, setStatus] = useState<'idle' | 'rendering' | 'done' | 'error'>('idle')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Clean up object URL on unmount or new render
  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl)
    }
  }, [resultUrl])

  const handleRender = async () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl)
      setResultUrl(null)
    }
    setError(null)
    setStatus('rendering')

    // Notify the viewer to prepare for a high-res capture (optional hook for future).
    const { w, h } = RESOLUTIONS[resolution]
    window.dispatchEvent(
      new CustomEvent('aruct:render-request', {
        detail: { width: w, height: h, quality },
      }),
    )

    // Wait for the renderer to settle.
    const settleMs = QUALITY_SETTLE_MS[quality]
    if (settleMs > 0) {
      await new Promise((r) => setTimeout(r, settleMs))
    }

    try {
      const blob = await captureViewerRender(w, h)
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Render failed')
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    a.download = `render-${resolution}.png`
    a.click()
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">High-Quality Render</h2>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-sidebar-foreground/70">
          Capture the current view as a high-resolution PNG using the live WebGPU renderer.
        </p>

        {/* Resolution */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-sidebar-foreground/70">Resolution</label>
          <div className="flex flex-col gap-1">
            {(Object.entries(RESOLUTIONS) as [Resolution, (typeof RESOLUTIONS)[Resolution]][]).map(
              ([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setResolution(key)}
                  className={`rounded-lg border px-3 py-2 text-xs text-left transition-colors ${
                    resolution === key
                      ? 'border-primary/60 bg-primary/10 text-sidebar-foreground'
                      : 'border-border/60 bg-transparent text-sidebar-foreground/60 hover:bg-accent/20'
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Quality */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-sidebar-foreground/70">Quality</label>
          <div className="flex gap-1.5">
            {(['draft', 'standard', 'high'] as Quality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-xs capitalize transition-colors ${
                  quality === q
                    ? 'border-primary/60 bg-primary/10 text-sidebar-foreground'
                    : 'border-border/60 bg-transparent text-sidebar-foreground/60 hover:bg-accent/20'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        {/* Render button */}
        <button
          type="button"
          disabled={status === 'rendering'}
          onClick={() => void handleRender()}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-3.5 w-3.5" />
          {status === 'rendering' ? 'Rendering…' : 'Render'}
        </button>

        {/* Preview + download */}
        {status === 'done' && resultUrl && (
          <div className="flex flex-col gap-2">
            <div className="overflow-hidden rounded-lg border border-border/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="Render preview" className="w-full" src={resultUrl} />
            </div>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
            >
              Download PNG
            </button>
          </div>
        )}

        <p className="text-center text-xs text-sidebar-foreground/40">
          Renders the current camera view — no upload required.
        </p>
      </div>
    </div>
  )
}
