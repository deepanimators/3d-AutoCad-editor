'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Star, Download, BadgeCheck } from 'lucide-react'
import type { PluginRegistryRow } from '@/lib/db/schema'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning-muted text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  deprecated: 'bg-muted text-muted-foreground',
}

export function MarketplaceAdminSection({
  pending: initialPending,
  all: initialAll,
}: {
  pending: PluginRegistryRow[]
  all: PluginRegistryRow[]
}) {
  const [pending, setPending] = useState(initialPending)
  const [all, setAll] = useState(initialAll)
  const [loading, setLoading] = useState<string | null>(null)

  async function setStatus(id: string, status: 'approved' | 'rejected') {
    setLoading(id)
    try {
      const res = await fetch(`/api/plugins/marketplace/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) return
      setPending((p) => p.filter((x) => x.id !== id))
      setAll((a) => a.map((x) => x.id === id ? { ...x, status } : x))
    } finally {
      setLoading(null)
    }
  }

  async function toggleFeatured(id: string, featured: boolean) {
    setLoading(id)
    try {
      const res = await fetch(`/api/plugins/marketplace/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ featured }),
      })
      if (!res.ok) return
      setAll((a) => a.map((x) => x.id === id ? { ...x, featured } : x))
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className="space-y-6">
      {/* Pending review */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-lg">Pending Review</h2>
          {pending.length > 0 && (
            <span className="rounded-full bg-warning-muted px-2 py-0.5 text-xs font-semibold text-warning">
              {pending.length}
            </span>
          )}
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-border p-4">
            No submissions awaiting review.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div key={p.id} className="rounded-xl border border-warning/30 bg-warning-muted/20 p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs text-muted-foreground">v{p.version}</span>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">by {p.authorName}</p>
                  <p className="text-sm mt-1">{p.description}</p>
                  <a
                    href={p.manifestUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand underline mt-1 inline-block"
                  >
                    View manifest
                  </a>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={loading === p.id}
                    onClick={() => setStatus(p.id, 'approved')}
                    className="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={loading === p.id}
                    onClick={() => setStatus(p.id, 'rejected')}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All marketplace plugins */}
      <div>
        <h2 className="font-semibold text-lg mb-3">
          All Marketplace Plugins ({all.length})
        </h2>
        {all.length === 0 ? (
          <p className="text-sm text-muted-foreground rounded-lg border border-border p-4">
            No marketplace plugins yet.
          </p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plugin</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Author</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stats</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {all.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.verified && <BadgeCheck className="h-3.5 w-3.5 text-brand" />}
                        {p.featured && <Star className="h-3.5 w-3.5 text-yellow-500 fill-current" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.category} · v{p.version}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.authorName}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Download className="h-3 w-3" />
                          {p.installCount}
                        </span>
                        {p.rating ? (
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            {Number(p.rating).toFixed(1)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[p.status] ?? 'bg-muted text-muted-foreground'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {p.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              disabled={loading === p.id}
                              onClick={() => setStatus(p.id, 'approved')}
                              className="text-xs text-success hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={loading === p.id}
                              onClick={() => setStatus(p.id, 'rejected')}
                              className="text-xs text-destructive hover:underline disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          disabled={loading === p.id}
                          onClick={() => toggleFeatured(p.id, !p.featured)}
                          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                        >
                          {p.featured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
