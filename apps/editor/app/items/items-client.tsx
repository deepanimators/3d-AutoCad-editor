'use client'

import { useState } from 'react'
import type { CustomItemRow } from '@/lib/db/schema'

type Item = CustomItemRow

const CATEGORIES = ['furniture', 'kitchen', 'bathroom', 'structure', 'other'] as const

function PackageIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  )
}

const EMPTY_FORM = {
  name: '',
  glbUrl: '',
  thumbnailUrl: '',
  category: 'other' as (typeof CATEGORIES)[number],
  tags: '',
}

export function ItemsClient({
  initialItems,
  canUpload,
}: {
  initialItems: Item[]
  canUpload: boolean
}) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch('/api/items/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          glbUrl: form.glbUrl,
          thumbnailUrl: form.thumbnailUrl || undefined,
          category: form.category,
          tags: form.tags
            ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Upload failed')
      }

      const data = (await res.json()) as { item: Item }
      setItems((prev) => [data.item, ...prev])
      setForm(EMPTY_FORM)
      setUploadOpen(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground">My Items</h1>
          <p className="mt-1 text-muted-foreground text-sm">Custom 3D objects for your scenes</p>
        </div>
        {items.length > 0 && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* Upload section */}
      {canUpload ? (
        <div className="rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setUploadOpen((o) => !o)}
            className="flex w-full items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/30 transition-colors rounded-xl"
          >
            <span>Upload new item</span>
            <span className="text-muted-foreground text-xs">{uploadOpen ? '▲' : '▼'}</span>
          </button>

          {uploadOpen && (
            <form onSubmit={handleUpload} className="border-t border-border px-5 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Office Chair"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  GLB file URL * — paste a public URL to your .glb file
                </label>
                <input
                  required
                  type="url"
                  value={form.glbUrl}
                  onChange={(e) => setForm((f) => ({ ...f, glbUrl: e.target.value }))}
                  placeholder="https://example.com/model.glb"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Thumbnail URL (optional)</label>
                  <input
                    type="url"
                    value={form.thumbnailUrl}
                    onChange={(e) => setForm((f) => ({ ...f, thumbnailUrl: e.target.value }))}
                    placeholder="https://example.com/thumb.png"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tags (comma-separated, optional)</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="seating, modern, office"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              {formError && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
                >
                  {submitting ? 'Adding…' : 'Add item'}
                </button>
                <button
                  type="button"
                  onClick={() => { setUploadOpen(false); setFormError(null); setForm(EMPTY_FORM) }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-background px-5 py-5">
          <p className="text-sm font-medium text-foreground">Upgrade to Pro to upload custom items</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Custom item uploads are available on the Pro and Team plans.
          </p>
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-background p-12 text-center">
          <p className="text-muted-foreground text-sm">No items yet. Upload your first GLB object above.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const tags: string[] = (() => {
              try { return JSON.parse(item.tags) as string[] } catch { return [] }
            })()

            return (
              <li key={item.id} className="rounded-xl border border-border bg-background overflow-hidden">
                {/* Thumbnail */}
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-muted text-muted-foreground/40">
                    <PackageIcon />
                  </div>
                )}

                {/* Card body */}
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm text-foreground leading-tight">{item.name}</p>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground capitalize">
                      {item.category}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="mt-1 text-xs text-destructive hover:underline disabled:opacity-50 transition-opacity"
                  >
                    {deletingId === item.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
