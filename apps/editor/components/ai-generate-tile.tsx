'use client'

import { Loader2, Sparkles, X } from 'lucide-react'
import { useRef, useState } from 'react'

type Props = {
  /** Called with the GLB URL when generation succeeds, so the parent can refresh items */
  onGenerated?: () => void
}

export function AiGenerateTile({ onGenerated }: Props) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleGenerate() {
    const text = prompt.trim()
    if (!text || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tripo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      })
      const data = (await res.json()) as { glbUrl?: string; error?: string }
      if (!res.ok || !data.glbUrl) {
        setError(data.error ?? 'Generation failed')
        return
      }
      setPrompt('')
      setOpen(false)
      onGenerated?.()
    } catch {
      setError('Network error, try again')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true)
          setTimeout(() => inputRef.current?.focus(), 50)
        }}
        className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-brand/40 bg-brand/5 p-2 text-brand transition-colors hover:bg-brand/10 hover:border-brand/60 aspect-square w-full"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[10px] font-medium leading-tight text-center">Generate</span>
      </button>
    )
  }

  return (
    <div className="col-span-full rounded-xl border border-brand/30 bg-brand/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Generate 3D model
        </span>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null) }}
          className="text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') void handleGenerate() }}
        placeholder="Describe a 3D object…"
        disabled={loading}
        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-brand/60 disabled:opacity-60"
      />
      {error && <p className="text-[10px] text-destructive">{error}</p>}
      <button
        type="button"
        onClick={() => void handleGenerate()}
        disabled={loading || !prompt.trim()}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-opacity disabled:opacity-50"
      >
        {loading ? (
          <><Loader2 className="h-3 w-3 animate-spin" /> Generating… (up to 2 min)</>
        ) : (
          <><Sparkles className="h-3 w-3" /> Generate</>
        )}
      </button>
      {loading && (
        <p className="text-[10px] text-center text-muted-foreground">
          Model will appear in Your Items when ready
        </p>
      )}
    </div>
  )
}
