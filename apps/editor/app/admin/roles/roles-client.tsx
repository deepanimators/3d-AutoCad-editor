'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ALL_PERMISSIONS, type Permission } from '@/lib/permissions'
import type { RoleRow } from '@/lib/db/schema'

type RoleWithPermissions = Omit<RoleRow, 'permissions'> & { permissions: string[] }

function parseRole(row: RoleRow): RoleWithPermissions {
  return { ...row, permissions: JSON.parse(row.permissions) as string[] }
}

type FormState = {
  name: string
  description: string
  permissions: Permission[]
}

const EMPTY_FORM: FormState = { name: '', description: '', permissions: [] }

function RoleForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial: FormState
  onSubmit: (data: FormState) => Promise<void>
  onCancel: () => void
  submitting: boolean
}) {
  const [form, setForm] = useState<FormState>(initial)

  function togglePermission(p: Permission) {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(p)
        ? prev.permissions.filter((x) => x !== p)
        : [...prev.permissions, p],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSubmit(form)
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. moderator"
            required
            pattern="[a-zA-Z0-9_-]+"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Short description"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">Permissions</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PERMISSIONS.map((p) => (
            <label
              key={p}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs cursor-pointer select-none transition-colors ${
                form.permissions.includes(p as Permission)
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/50'
              }`}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={form.permissions.includes(p as Permission)}
                onChange={() => togglePermission(p as Permission)}
              />
              {p}
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-80 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function RolesClient({ allRoles }: { allRoles: RoleRow[] }) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const parsed = allRoles.map(parseRole)
  const customRoles = parsed.filter((r) => !r.isSystem)
  const systemRoles = parsed.filter((r) => r.isSystem)

  async function handleCreate(data: FormState) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { error?: string; message?: string }
      if (!res.ok) { setError(json.message ?? json.error ?? 'Failed'); setSubmitting(false); return }
      setShowAdd(false)
      router.refresh()
    } catch {
      setError('Request failed')
    }
    setSubmitting(false)
  }

  async function handleEdit(id: string, data: FormState) {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json() as { error?: string; message?: string }
      if (!res.ok) { setError(json.message ?? json.error ?? 'Failed'); setSubmitting(false); return }
      setEditingId(null)
      router.refresh()
    } catch {
      setError('Request failed')
    }
    setSubmitting(false)
  }

  async function handleDelete(id: string, name: string) {
    if (!window.confirm(`Delete role "${name}"? This cannot be undone.`)) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: 'DELETE' })
      const json = await res.json() as { error?: string; message?: string }
      if (!res.ok) { setError(json.message ?? json.error ?? 'Failed'); return }
      router.refresh()
    } catch {
      setError('Request failed')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* System roles */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {systemRoles.map((r) => (
              <tr key={r.id} className="hover:bg-muted/20">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{r.description}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.permissions.map((p) => (
                      <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">System</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom roles */}
      {customRoles.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Permissions</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customRoles.map((r) => (
                <>
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{r.description}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.permissions.length === 0
                          ? <span className="text-muted-foreground/50 text-xs">none</span>
                          : r.permissions.map((p) => (
                            <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{p}</span>
                          ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(editingId === r.id ? null : r.id)}
                          className="rounded px-2 py-0.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(r.id, r.name)}
                          className="rounded px-2 py-0.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === r.id && (
                    <tr key={`${r.id}-edit`}>
                      <td colSpan={4} className="px-4 py-4 bg-muted/20">
                        <RoleForm
                          initial={{ name: r.name, description: r.description, permissions: r.permissions as Permission[] }}
                          onSubmit={(data) => handleEdit(r.id, data)}
                          onCancel={() => setEditingId(null)}
                          submitting={submitting}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add role form */}
      {showAdd ? (
        <div className="rounded-xl border border-border p-4">
          <h3 className="font-medium text-sm mb-4">New Custom Role</h3>
          <RoleForm
            initial={EMPTY_FORM}
            onSubmit={handleCreate}
            onCancel={() => setShowAdd(false)}
            submitting={submitting}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-lg border border-dashed border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:border-foreground/50 hover:text-foreground"
        >
          + Add Role
        </button>
      )}
    </div>
  )
}
