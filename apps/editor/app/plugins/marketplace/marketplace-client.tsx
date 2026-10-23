'use client'

import { useState, useMemo } from 'react'
import { Search, Star, Download, BadgeCheck, Sparkles, Plus } from 'lucide-react'
import type { PluginRegistryRow } from '@/lib/db/schema'

type Props = { initialPlugins: PluginRegistryRow[] }

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'visualization', label: 'Visualization' },
  { key: 'mep', label: 'MEP' },
  { key: 'structural', label: 'Structural' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'import-export', label: 'Import / Export' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'other', label: 'Other' },
]

export function MarketplaceClient({ initialPlugins }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [installed, setInstalled] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<string | null>(null)

  const plugins = useMemo(() => {
    return initialPlugins.filter((p) => {
      if (category !== 'all' && p.category !== category) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.description.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [initialPlugins, category, search])

  const featured = plugins.filter((p) => p.featured)
  const regular = plugins.filter((p) => !p.featured)

  async function toggleInstall(id: string) {
    setLoading(id)
    try {
      const method = installed.has(id) ? 'DELETE' : 'POST'
      const res = await fetch(`/api/plugins/marketplace/${id}/install`, { method })
      if (res.ok) {
        setInstalled((prev) => {
          const next = new Set(prev)
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
        })
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b border-border bg-sidebar px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight">Plugin Marketplace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Extend Aruct with community-built tools and integrations</p>
          <div className="mt-4 flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search plugins…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <a
              href="/plugins/submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-brand-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Submit plugin
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-6">
        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-6">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === c.key
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="h-4 w-4 text-brand" />
              <h2 className="text-sm font-semibold">Featured</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {featured.map((p) => (
                <PluginCard key={p.id} plugin={p} installed={installed.has(p.id)} loading={loading === p.id} onToggle={toggleInstall} />
              ))}
            </div>
          </section>
        )}

        {/* All plugins */}
        {regular.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regular.map((p) => (
              <PluginCard key={p.id} plugin={p} installed={installed.has(p.id)} loading={loading === p.id} onToggle={toggleInstall} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground text-sm">
            No plugins found.{' '}
            <a href="/plugins/submit" className="text-brand underline">
              Submit the first one.
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function PluginCard({
  plugin,
  installed,
  loading,
  onToggle,
}: {
  plugin: PluginRegistryRow
  installed: boolean
  loading: boolean
  onToggle: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {plugin.iconUrl ? (
          <img src={plugin.iconUrl} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0 text-lg font-bold text-muted-foreground">
            {plugin.name[0]}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-sm truncate">{plugin.name}</span>
            {plugin.verified && <BadgeCheck className="h-3.5 w-3.5 text-brand shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground truncate">{plugin.authorName}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{plugin.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {plugin.rating ? (
            <span className="flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {Number(plugin.rating).toFixed(1)}
            </span>
          ) : null}
          <span className="flex items-center gap-0.5">
            <Download className="h-3 w-3" />
            {plugin.installCount.toLocaleString()}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{plugin.category}</span>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => onToggle(plugin.id)}
          className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
            installed
              ? 'bg-muted text-foreground hover:bg-destructive/10 hover:text-destructive'
              : 'bg-brand text-brand-foreground hover:opacity-90'
          }`}
        >
          {loading ? '…' : installed ? 'Installed' : 'Install'}
        </button>
      </div>
    </div>
  )
}
