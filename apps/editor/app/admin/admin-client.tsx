'use client'

import { useState } from 'react'
import { signInWithCustomToken } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'

type UserRow = {
  id: string
  email: string
  name: string
  plan: string
  role: string
  subscriptionStatus: string | null
  createdAt: string | null
}

const PLAN_COLORS: Record<string, string> = {
  pro: 'bg-blue-100 text-blue-700',
  team: 'bg-violet-100 text-violet-700',
  free: 'bg-muted text-muted-foreground',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-red-100 text-red-700',
}

async function updateUser(id: string, patch: Record<string, unknown>) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error('Update failed')
  return res.json()
}

function RoleSelect({ userId, value }: { userId: string; value: string }) {
  const [role, setRole] = useState(value)
  const [saving, setSaving] = useState(false)

  async function onChange(next: string) {
    setSaving(true)
    try {
      await updateUser(userId, { role: next })
      setRole(next)
    } catch {}
    setSaving(false)
  }

  return (
    <select
      value={role}
      onChange={(e) => onChange(e.target.value)}
      disabled={saving}
      className={`rounded px-2 py-0.5 text-xs font-medium border border-transparent cursor-pointer hover:border-border focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${
        role === 'admin' ? 'text-orange-600 bg-orange-50' : 'text-muted-foreground bg-transparent'
      }`}
    >
      <option value="user">user</option>
      <option value="admin">admin</option>
    </select>
  )
}

function PlanSelect({ userId, value }: { userId: string; value: string }) {
  const [plan, setPlan] = useState(value)
  const [saving, setSaving] = useState(false)

  async function onChange(next: string) {
    setSaving(true)
    try {
      await updateUser(userId, { plan: next })
      setPlan(next)
    } catch {}
    setSaving(false)
  }

  return (
    <select
      value={plan}
      onChange={(e) => onChange(e.target.value)}
      disabled={saving}
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${PLAN_COLORS[plan] ?? 'bg-muted text-muted-foreground'}`}
    >
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="team">Team</option>
    </select>
  )
}

function StatusSelect({ userId, value }: { userId: string; value: string | null }) {
  const [status, setStatus] = useState(value ?? '')
  const [saving, setSaving] = useState(false)

  async function onChange(next: string) {
    setSaving(true)
    try {
      await updateUser(userId, { subscriptionStatus: next || null })
      setStatus(next)
    } catch {}
    setSaving(false)
  }

  const display = status || 'free tier'
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      disabled={saving}
      className={`rounded-full px-2 py-0.5 text-xs font-medium border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 ${
        STATUS_COLORS[status] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      <option value="">free tier</option>
      <option value="active">active</option>
      <option value="trialing">trialing</option>
      <option value="past_due">past_due</option>
      <option value="canceled">canceled</option>
    </select>
  )
}

function ImpersonateButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImpersonate() {
    if (!window.confirm('Sign in as this user? Your admin session will be replaced.')) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = (await res.json()) as { customToken?: string; error?: string }
      if (!data.customToken) { setError(data.error ?? 'Failed'); setLoading(false); return }

      const credential = await signInWithCustomToken(firebaseAuth, data.customToken)
      const idToken = await credential.user.getIdToken()
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impersonation failed')
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleImpersonate()}
        className="rounded px-2 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-50"
        title="Sign in as this user"
      >
        {loading ? '…' : 'Impersonate'}
      </button>
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  )
}

export function AdminClient({ users }: { users: UserRow[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Joined</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-muted/20">
              <td className="px-4 py-3">
                <div className="font-medium">{u.name}</div>
                <div className="text-muted-foreground text-xs">{u.email}</div>
              </td>
              <td className="px-4 py-3">
                <PlanSelect userId={u.id} value={u.plan} />
              </td>
              <td className="px-4 py-3">
                <StatusSelect userId={u.id} value={u.subscriptionStatus} />
              </td>
              <td className="px-4 py-3">
                <RoleSelect userId={u.id} value={u.role} />
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <ImpersonateButton userId={u.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
