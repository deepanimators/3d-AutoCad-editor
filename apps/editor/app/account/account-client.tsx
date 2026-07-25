'use client'

import { Crown, CreditCard, Settings, Shield } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

type Props = {
  user: {
    name: string
    email: string
    plan: 'free' | 'pro' | 'team'
    role: 'user' | 'admin'
    subscriptionStatus: string | null
    planExpiresAt: string | null
    stripeCustomerId: string | null
  }
  sceneLimit: number | null
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

export function AccountClient({ user, sceneLimit }: Props) {
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
            <Row label="Name" value={user.name} />
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
