'use client'

import { useState } from 'react'
import { Building2, ChevronRight, Plus, Crown } from 'lucide-react'

type Org = {
  id: string
  name: string
  slug: string
  memberRole: string
}

type Props = {
  orgs: Org[]
  canCreate: boolean
}

export function OrgListClient({ orgs, canCreate }: Props) {
  const [creating, setCreating] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/orgs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error === 'slug_taken' ? 'Name already taken.' : 'Failed to create workspace.')
        setLoading(false)
        return
      }
      window.location.href = `/org/${data.slug}`
    } catch {
      setError('Network error.')
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground tracking-tight">Team Workspaces</h1>
            <p className="mt-1 text-muted-foreground text-sm">Collaborate with your team in shared spaces.</p>
          </div>
          {canCreate && !creating && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              New workspace
            </button>
          )}
        </div>

        {creating && (
          <div className="mb-6 rounded-xl border border-border bg-background p-5">
            <h2 className="mb-3 font-semibold text-sm">Create workspace</h2>
            <form onSubmit={(e) => void handleCreate(e)} className="space-y-3">
              <input
                autoFocus
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={loading}
                placeholder="Workspace name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              {error && <p className="text-destructive text-xs">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !nameInput.trim()}
                  className="rounded-lg bg-brand px-4 py-1.5 text-brand-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => { setCreating(false); setError(null); setNameInput('') }}
                  className="rounded-lg border border-border px-4 py-1.5 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {orgs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No workspaces yet</p>
            <p className="mt-1 text-muted-foreground text-sm">Create one to collaborate with your team.</p>
            {!canCreate && (
              <p className="mt-3 text-xs text-muted-foreground">
                Team plan required.{' '}
                <a href="/pricing" className="text-foreground underline">Upgrade →</a>
              </p>
            )}
            {canCreate && !creating && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className="mt-6 flex items-center gap-1.5 mx-auto rounded-lg bg-brand px-4 py-2 text-brand-foreground text-sm font-semibold hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                New workspace
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-2">
            {orgs.map((org) => (
              <li key={org.id}>
                <a
                  href={`/org/${org.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-4 hover:border-brand/40 hover:shadow-sm transition-all"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-muted text-purple">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{org.name}</p>
                    <p className="text-muted-foreground text-xs capitalize">{org.memberRole}</p>
                  </div>
                  {org.memberRole === 'owner' && (
                    <Crown className="h-3.5 w-3.5 shrink-0 text-purple" />
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
