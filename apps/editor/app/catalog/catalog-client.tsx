'use client'

import { useState, useCallback, useRef } from 'react'
import { Search, Download, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type CatalogModel = {
  id: string
  slug: string
  name: string
  description: string | null
  source: string
  license: string
  attribution: string | null
  glbUrl: string
  thumbnailUrl: string | null
  isNew: boolean
  addedAt: string
  tags: string[]
  category: string | null
  polyCount: number | null
}

type ExternalModel = {
  sourceId: string
  source: 'polyhaven' | 'polypizza'
  name: string
  description: string | null
  glbUrl: string
  thumbnailUrl: string | null
  license: string
  attribution: string | null
  tags: string[]
  category: string | null
  polyCount: number | null
}

const CATEGORIES = ['All', 'Furniture', 'Architecture', 'Nature', 'Characters', 'Vehicles', 'Other']

const SOURCES = [
  { id: 'all', label: 'All Sources' },
  { id: 'polyhaven', label: 'Poly Haven' },
  { id: 'polypizza', label: 'Poly Pizza' },
  { id: 'sketchfab', label: 'Sketchfab' },
  { id: 'tripo3d', label: 'Tripo3D' },
]

const SOURCE_COLORS: Record<string, string> = {
  polyhaven: 'bg-emerald-500/15 text-emerald-400',
  polypizza: 'bg-orange-500/15 text-orange-400',
  sketchfab: 'bg-blue-500/15 text-blue-400',
  tripo3d: 'bg-purple-500/15 text-purple-400',
  smithsonian: 'bg-amber-500/15 text-amber-400',
}

const SOURCE_NAMES: Record<string, string> = {
  polyhaven: 'Poly Haven',
  polypizza: 'Poly Pizza',
  sketchfab: 'Sketchfab',
  tripo3d: 'Tripo3D',
  smithsonian: 'Smithsonian',
}

const LICENSE_COLORS: Record<string, string> = {
  CC0: 'bg-green-500/15 text-green-400',
  'CC BY 4.0': 'bg-blue-500/15 text-blue-400',
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function ModelCard({ model, isLoggedIn }: { model: CatalogModel; isLoggedIn: boolean }) {
  return (
    <div className="group relative rounded-xl border border-border/60 bg-background overflow-hidden transition-all duration-150 hover:border-border hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {model.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.thumbnailUrl}
            alt={model.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-lg font-semibold">
            {getInitials(model.name)}
          </div>
        )}

        {/* New badge */}
        {model.isNew && (
          <span className="absolute top-2 right-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground shadow">
            New
          </span>
        )}

        {/* Import overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          {isLoggedIn ? (
            <a
              href={model.glbUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Import
            </a>
          ) : (
            <a
              href="/login?next=/catalog"
              className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md hover:bg-muted transition-colors"
            >
              Sign in to import
            </a>
          )}
        </div>
      </div>

      {/* Card info */}
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="truncate text-sm font-medium text-foreground leading-tight" title={model.name}>
          {model.name}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Source badge */}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              SOURCE_COLORS[model.source] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {SOURCE_NAMES[model.source] ?? model.source}
          </span>

          {/* License badge */}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              LICENSE_COLORS[model.license] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {model.license}
          </span>
        </div>
      </div>
    </div>
  )
}

function ExternalModelCard({
  model,
  isImporting,
  isImported,
  onImport,
}: {
  model: ExternalModel
  isImporting: boolean
  isImported: boolean
  onImport: (model: ExternalModel) => void
}) {
  return (
    <div className="group relative rounded-xl border border-border/60 bg-background overflow-hidden transition-all duration-150 hover:border-border hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {model.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={model.thumbnailUrl}
            alt={model.name}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 text-lg font-semibold">
            {getInitials(model.name)}
          </div>
        )}

        {/* Import overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => !isImported && onImport(model)}
            disabled={isImporting || isImported}
            className="flex items-center gap-1.5 rounded-lg bg-background px-3 py-2 text-xs font-medium text-foreground shadow-md hover:bg-muted transition-colors disabled:opacity-70"
          >
            {isImporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isImported ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isImporting ? 'Importing…' : isImported ? 'Imported' : 'Import'}
          </button>
        </div>
      </div>

      {/* Card info */}
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="truncate text-sm font-medium text-foreground leading-tight" title={model.name}>
          {model.name}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Source badge */}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              SOURCE_COLORS[model.source] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {SOURCE_NAMES[model.source] ?? model.source}
          </span>

          {/* License badge */}
          <span
            className={cn(
              'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
              LICENSE_COLORS[model.license] ?? 'bg-muted text-muted-foreground'
            )}
          >
            {model.license}
          </span>
        </div>
        {model.polyCount != null && (
          <p className="text-[10px] text-muted-foreground/60">
            {model.polyCount.toLocaleString()} triangles
          </p>
        )}
      </div>
    </div>
  )
}

export function CatalogClient({
  initialModels,
  totalModels,
  isLoggedIn,
}: {
  initialModels: CatalogModel[]
  totalModels: number
  isLoggedIn: boolean
}) {
  // Tab state
  const [tab, setTab] = useState<'catalog' | 'discover'>('catalog')

  // Catalog tab state
  const [models, setModels] = useState<CatalogModel[]>(initialModels)
  const [total, setTotal] = useState(totalModels)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [source, setSource] = useState('all')
  const [isNewOnly, setIsNewOnly] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Discover tab state
  const [discoverQ, setDiscoverQ] = useState('')
  const [discoverSource, setDiscoverSource] = useState<'all' | 'polyhaven' | 'polypizza'>('all')
  const [discoverResults, setDiscoverResults] = useState<ExternalModel[]>([])
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [discoverError, setDiscoverError] = useState<string | null>(null)
  const [importing, setImporting] = useState<Set<string>>(new Set())
  const [imported, setImported] = useState<Set<string>>(new Set())

  const discoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchModels = useCallback(
    async (params: {
      q: string
      category: string
      source: string
      isNew: boolean
      page: number
      append: boolean
    }) => {
      setLoading(true)
      try {
        const sp = new URLSearchParams()
        sp.set('limit', '24')
        sp.set('page', String(params.page))
        if (params.q) sp.set('q', params.q)
        if (params.category !== 'All') sp.set('category', params.category.toLowerCase())
        if (params.source !== 'all') sp.set('source', params.source)
        if (params.isNew) sp.set('isNew', 'true')

        const res = await fetch(`/api/catalog?${sp.toString()}`)
        if (!res.ok) return

        const data = (await res.json()) as { models: CatalogModel[]; total: number }
        setTotal(data.total)
        setModels((prev) => (params.append ? [...prev, ...data.models] : data.models))
        setPage(params.page)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  async function fetchExternal(q: string, src: string) {
    if (!q.trim()) { setDiscoverResults([]); return }
    setDiscoverLoading(true)
    setDiscoverError(null)
    try {
      const sp = new URLSearchParams({ q, source: src, limit: '24' })
      const res = await fetch(`/api/catalog/external?${sp}`)
      if (!res.ok) throw new Error('Search failed')
      const data = await res.json() as { results: ExternalModel[] }
      setDiscoverResults(data.results)
    } catch {
      setDiscoverError('Search failed. Please try again.')
    } finally {
      setDiscoverLoading(false)
    }
  }

  async function importModel(model: ExternalModel) {
    if (!isLoggedIn) { window.location.href = '/login?next=/catalog'; return }
    setImporting(prev => new Set(prev).add(model.sourceId))
    try {
      const res = await fetch('/api/catalog/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: model.source,
          sourceId: model.sourceId,
          name: model.name,
          description: model.description,
          glbUrl: model.glbUrl,
          thumbnailUrl: model.thumbnailUrl ?? undefined,
          license: model.license,
          attribution: model.attribution ?? undefined,
          tags: model.tags,
          category: model.category ?? undefined,
        }),
      })
      if (res.ok) {
        setImported(prev => new Set(prev).add(model.sourceId))
        // Refresh catalog in background so it's ready when user navigates there
        void fetchModels({ q, category, source, isNew: isNewOnly, page: 1, append: false })
      }
    } finally {
      setImporting(prev => { const s = new Set(prev); s.delete(model.sourceId); return s })
    }
  }

  function handleSearchChange(value: string) {
    setQ(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      void fetchModels({ q: value, category, source, isNew: isNewOnly, page: 1, append: false })
    }, 300)
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    void fetchModels({ q, category: cat, source, isNew: isNewOnly, page: 1, append: false })
  }

  function handleSourceChange(src: string) {
    setSource(src)
    void fetchModels({ q, category, source: src, isNew: isNewOnly, page: 1, append: false })
  }

  function handleIsNewToggle() {
    const next = !isNewOnly
    setIsNewOnly(next)
    void fetchModels({ q, category, source, isNew: next, page: 1, append: false })
  }

  function handleLoadMore() {
    void fetchModels({ q, category, source, isNew: isNewOnly, page: page + 1, append: true })
  }

  function handleDiscoverSearchChange(value: string) {
    setDiscoverQ(value)
    if (discoverDebounceRef.current) clearTimeout(discoverDebounceRef.current)
    discoverDebounceRef.current = setTimeout(() => {
      void fetchExternal(value, discoverSource)
    }, 400)
  }

  function handleDiscoverSourceChange(src: 'all' | 'polyhaven' | 'polypizza') {
    setDiscoverSource(src)
    void fetchExternal(discoverQ, src)
  }

  const hasMore = models.length < total

  return (
    <div className="px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-foreground">Model Catalog</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Browse and import free 3D models from multiple sources
          </p>
        </div>
        {tab === 'catalog' && (
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {total.toLocaleString()} models
          </span>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('catalog')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'catalog'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Catalog
        </button>
        <button
          type="button"
          onClick={() => setTab('discover')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            tab === 'discover'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          Discover
        </button>
      </div>

      {/* Login prompt for non-authenticated users */}
      {!isLoggedIn && (
        <div className="rounded-xl border border-border bg-background px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <a href="/login?next=/catalog" className="text-brand font-medium hover:underline">
              Sign in
            </a>{' '}
            to import models directly into your scenes.
          </p>
        </div>
      )}

      {/* Catalog tab */}
      {tab === 'catalog' && (
        <>
          {/* Search + Filters */}
          <div className="space-y-3">
            {/* Search input */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={q}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search models…"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Filter row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category buttons */}
              <div className="flex flex-wrap gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryChange(cat)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      category === cat
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Source select */}
              <select
                value={source}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>

              {/* New only toggle */}
              <button
                type="button"
                onClick={handleIsNewToggle}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  isNewOnly
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                New only
              </button>
            </div>
          </div>

          {/* Loading indicator (initial/filter change) */}
          {loading && models.length === 0 && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Empty state */}
          {!loading && models.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 bg-background p-16 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No models found.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )}

          {/* Model grid */}
          {models.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {models.map((model) => (
                <ModelCard key={model.id} model={model} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </>
                ) : (
                  `Load more (${total - models.length} remaining)`
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Discover tab */}
      {tab === 'discover' && (
        <>
          <div className="space-y-3">
            {/* Source filter */}
            <div className="flex gap-1">
              {(['all', 'polyhaven', 'polypizza'] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => handleDiscoverSourceChange(src)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    discoverSource === src
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  )}
                >
                  {src === 'all' ? 'All' : src === 'polyhaven' ? 'Poly Haven' : 'Poly Pizza'}
                </button>
              ))}
            </div>

            {/* Search input */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={discoverQ}
                onChange={(e) => handleDiscoverSearchChange(e.target.value)}
                placeholder="Search external models…"
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Empty state — no query */}
          {!discoverQ.trim() && (
            <div className="rounded-xl border border-dashed border-border/60 bg-background p-16 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">
                Search Poly Haven and Poly Pizza for free 3D models.
              </p>
            </div>
          )}

          {/* Loading */}
          {discoverLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error */}
          {discoverError && !discoverLoading && (
            <div className="rounded-xl border border-dashed border-border/60 bg-background p-16 text-center">
              <p className="text-muted-foreground text-sm">{discoverError}</p>
            </div>
          )}

          {/* Empty results */}
          {!discoverLoading && !discoverError && discoverQ.trim() && discoverResults.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 bg-background p-16 text-center">
              <Search className="mx-auto h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">No results found.</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Try a different search term or source.
              </p>
            </div>
          )}

          {/* Results grid */}
          {!discoverLoading && discoverResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {discoverResults.map((model) => (
                <ExternalModelCard
                  key={`${model.source}:${model.sourceId}`}
                  model={model}
                  isImporting={importing.has(model.sourceId)}
                  isImported={imported.has(model.sourceId)}
                  onImport={importModel}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
