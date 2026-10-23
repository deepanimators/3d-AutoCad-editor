'use client'

import { useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'

const CATEGORIES = [
  'visualization', 'mep', 'structural', 'analysis', 'import-export', 'productivity', 'other',
]

export default function SubmitPluginPage() {
  const [form, setForm] = useState({
    name: '', slug: '', description: '', authorName: '', authorUrl: '',
    version: '1.0.0', manifestUrl: '', iconUrl: '', category: 'other', tags: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/plugins/marketplace', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) }),
      })
      if (!res.ok) {
        const j = await res.json()
        setError(j.error ?? 'Submission failed')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Network error — try again')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-10 w-10 text-success mb-3" />
          <h1 className="text-xl font-bold">Plugin submitted</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            Your plugin is pending review. We'll notify you at your account email when it's approved.
          </p>
          <a href="/plugins/marketplace" className="mt-4 inline-block text-sm text-brand underline">
            Back to marketplace
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Submit a plugin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Share your plugin with the Aruct community. Submissions are reviewed before publishing.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <Row label="Plugin name" required>
          <Input value={form.name} onChange={(v) => set('name', v)} placeholder="My Awesome Plugin" />
        </Row>
        <Row label="Slug" required hint="URL-safe identifier, e.g. my-awesome-plugin">
          <Input value={form.slug} onChange={(v) => set('slug', v)} placeholder="my-awesome-plugin" />
        </Row>
        <Row label="Description" required>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What does your plugin do?"
            rows={3}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            required
          />
        </Row>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Author name" required>
            <Input value={form.authorName} onChange={(v) => set('authorName', v)} placeholder="Your name" />
          </Row>
          <Row label="Author URL">
            <Input value={form.authorUrl} onChange={(v) => set('authorUrl', v)} placeholder="https://..." />
          </Row>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Version" required>
            <Input value={form.version} onChange={(v) => set('version', v)} placeholder="1.0.0" />
          </Row>
          <Row label="Category" required>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Row>
        </div>
        <Row label="Manifest URL" required hint="URL to your plugin manifest JSON">
          <Input value={form.manifestUrl} onChange={(v) => set('manifestUrl', v)} placeholder="https://..." />
        </Row>
        <Row label="Icon URL">
          <Input value={form.iconUrl} onChange={(v) => set('iconUrl', v)} placeholder="https://... (32×32 or 64×64 PNG)" />
        </Row>
        <Row label="Tags" hint="Comma-separated, e.g. ifc, bim, export">
          <Input value={form.tags} onChange={(v) => set('tags', v)} placeholder="ifc, bim, export" />
        </Row>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          <Upload className="h-4 w-4" />
          {loading ? 'Submitting…' : 'Submit for review'}
        </button>
      </form>
    </div>
  )
}

function Row({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-muted-foreground mb-1">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
    />
  )
}
