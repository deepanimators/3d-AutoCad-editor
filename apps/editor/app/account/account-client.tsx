'use client'

import { useState } from 'react'
import { Crown, CreditCard, Settings, Shield, Pencil, Check, X } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

type AiUsage = {
  generationsUsed: number
  generationsLimit: number | null
  visionUsed: number
  visionLimit: number | null
  resetAt: string | null
}

type Props = {
  user: {
    name: string
    email: string
    plan: 'free' | 'pro' | 'team'
    role: string
    subscriptionStatus: string | null
    planExpiresAt: string | null
    stripeCustomerId: string | null
  }
  sceneLimit: number | null
  aiUsage?: AiUsage
}

const PLAN_LABELS = { free: 'Free', pro: 'Pro', team: 'Team' }
const PLAN_COLORS = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-700',
  team: 'bg-violet-100 text-violet-700',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past due',
  canceled: 'Canceled',
}

async function openBillingPortal() {
  const res = await fetch('/api/billing/portal', { method: 'POST' })
  const { url } = await res.json()
  if (url) window.location.href = url
}

export function AccountClient({ user, sceneLimit, aiUsage }: Props) {
  const [name, setName] = useState(user.name)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(user.name)
  const [saving, setSaving] = useState(false)

  async function saveName() {
    if (!nameInput.trim() || nameInput === name) { setEditingName(false); return }
    setSaving(true)
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setName(data.name)
    }
    setSaving(false)
    setEditingName(false)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl text-foreground">Account</h1>
          {user.role === 'admin' && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg bg-orange-50 border border-orange-200 px-3 py-1.5 text-orange-700 text-sm font-medium hover:bg-orange-100"
            >
              <Shield className="h-4 w-4" />
              Admin dashboard
            </a>
          )}
        </div>

        {/* Profile */}
        <div className="rounded-xl border border-border bg-background p-6">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-base">
            <Settings className="h-4 w-4" />
            Profile
          </h2>
          <div className="space-y-3 text-sm">
            {/* Editable name row */}
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <span className="text-muted-foreground">Name</span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    disabled={saving}
                    className="rounded p-1 text-green-600 hover:bg-green-50 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setNameInput(name); setEditingName(false) }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{name}</span>
                  <button
                    type="button"
                    onClick={() => { setNameInput(name); setEditingName(true) }}
                    className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <Row label="Email" value={user.email} />
            <Row label="Role" value={<span className="capitalize">{user.role}</span>} />
          </div>
        </div>

        {/* Subscription */}
        <div className="rounded-xl border border-border bg-background p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold text-base">
              <CreditCard className="h-4 w-4" />
              Subscription
            </h2>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PLAN_COLORS[user.plan]}`}>
                {PLAN_LABELS[user.plan]}
              </span>
              {user.subscriptionStatus && (
                <span className="text-muted-foreground text-xs">{STATUS_LABELS[user.subscriptionStatus] ?? user.subscriptionStatus}</span>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <Row label="Scene limit" value={sceneLimit === null ? 'Unlimited' : `${sceneLimit} scenes`} />
            {user.planExpiresAt && (
              <Row label="Next billing" value={new Date(user.planExpiresAt).toLocaleDateString()} />
            )}
          </div>

          {aiUsage && (aiUsage.generationsLimit !== 0 || aiUsage.visionLimit !== 0) && (
            <div className="mt-4 space-y-3 border-t border-border/50 pt-4 text-sm">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Usage this month</p>
              {aiUsage.generationsLimit !== 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI generations</span>
                    <span className="font-medium tabular-nums">
                      {aiUsage.generationsUsed}
                      {aiUsage.generationsLimit !== null ? ` / ${aiUsage.generationsLimit}` : ' / ∞'}
                    </span>
                  </div>
                  {aiUsage.generationsLimit !== null && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min(100, (aiUsage.generationsUsed / aiUsage.generationsLimit) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              {aiUsage.visionLimit !== 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vision calls</span>
                    <span className="font-medium tabular-nums">
                      {aiUsage.visionUsed}
                      {aiUsage.visionLimit !== null ? ` / ${aiUsage.visionLimit}` : ' / ∞'}
                    </span>
                  </div>
                  {aiUsage.visionLimit !== null && (
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500 transition-all"
                        style={{ width: `${Math.min(100, (aiUsage.visionUsed / aiUsage.visionLimit) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              {aiUsage.resetAt && (
                <p className="text-[11px] text-muted-foreground">
                  Resets on {new Date(new Date(aiUsage.resetAt).getFullYear(), new Date(aiUsage.resetAt).getMonth() + 1, 1).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {user.plan === 'free' && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              AI generation requires Pro plan.{' '}
              <a href="/pricing" className="text-foreground underline">Upgrade →</a>
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {user.plan !== 'free' && user.stripeCustomerId ? (
              <button
                type="button"
                onClick={openBillingPortal}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                Manage subscription
              </button>
            ) : null}
            {user.plan !== 'team' && (
              <a
                href="/pricing"
                className="flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-background text-sm font-medium hover:opacity-90"
              >
                <Crown className="h-4 w-4" />
                {user.plan === 'free' ? 'Upgrade to Pro' : 'Upgrade to Team'}
              </a>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-destructive/30 bg-background p-6">
          <h2 className="mb-4 font-semibold text-base text-destructive">Danger zone</h2>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-lg border border-destructive/30 px-4 py-2 text-destructive text-sm font-medium hover:bg-destructive/5"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
