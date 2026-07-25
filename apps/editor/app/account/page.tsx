import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { getSceneLimit } from '@/lib/feature-gates'

const PLAN_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past due',
  canceled: 'Canceled',
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/account')

  const sceneLimit = getSceneLimit(session)

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-bold text-2xl text-foreground">Account</h1>

        <div className="mt-8 rounded-xl border border-border bg-background p-6">
          <h2 className="font-semibold text-lg">Profile</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{session.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{session.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border bg-background p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Subscription</h2>
            <span className="rounded-full bg-foreground px-3 py-1 text-background text-xs font-medium">
              {PLAN_LABELS[session.plan] ?? session.plan}
              {session.subscriptionStatus ? ` · ${STATUS_LABELS[session.subscriptionStatus] ?? session.subscriptionStatus}` : ''}
            </span>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Scene limit</span>
              <span>{sceneLimit === null ? 'Unlimited' : sceneLimit}</span>
            </div>
            {session.planExpiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next billing</span>
                <span>{new Date(session.planExpiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {session.plan !== 'free' && session.stripeCustomerId ? (
              <BillingPortalButton />
            ) : (
              <a
                href="/pricing"
                className="rounded-lg bg-foreground px-4 py-2 text-background text-sm font-medium hover:opacity-90"
              >
                Upgrade plan
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function BillingPortalButton() {
  return (
    <button
      type="button"
      className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
      onClick={async () => {
        const res = await fetch('/api/billing/portal', { method: 'POST' })
        const { url } = await res.json()
        if (url) window.location.href = url
      }}
    >
      Manage subscription
    </button>
  )
}
