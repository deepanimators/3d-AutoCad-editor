import { getSession } from '@/lib/auth-server'

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['5 scenes', 'JSON export', 'Community support'],
    cta: 'Get started',
    href: '/signup',
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    features: ['Unlimited scenes', 'GLB & JSON export', 'MCP access', 'Priority support', '14-day free trial'],
    monthlyKey: 'pro-monthly',
    yearlyKey: 'pro-yearly',
    highlight: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '$79',
    period: '/seat/month',
    features: ['Everything in Pro', 'IFC export', 'Real-time collaboration', 'SSO', 'Audit log', '14-day free trial'],
    monthlyKey: 'team-monthly',
    yearlyKey: 'team-yearly',
    highlight: false,
  },
]

export default async function PricingPage() {
  const session = await getSession()

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="font-bold text-4xl text-foreground">Simple pricing</h1>
          <p className="mt-3 text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`rounded-2xl border p-6 ${
                plan.highlight
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background'
              }`}
            >
              <div className="mb-6">
                <h2 className="font-bold text-xl">{plan.name}</h2>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-bold text-3xl">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="mb-8 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {plan.key === 'free' ? (
                <a
                  href={session ? '/' : '/signup'}
                  className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  {session ? 'Current plan' : 'Get started free'}
                </a>
              ) : session ? (
                session.plan === plan.key ? (
                  <ManageButton highlight={plan.highlight} />
                ) : (
                  <UpgradeButton priceKey={plan.monthlyKey!} highlight={plan.highlight} />
                )
              ) : (
                <a
                  href={`/signup?next=/pricing`}
                  className={`block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-colors ${
                    plan.highlight
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-border hover:bg-accent'
                  }`}
                >
                  Start free trial
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UpgradeButton({ priceKey, highlight }: { priceKey: string; highlight: boolean }) {
  return (
    <form action="/api/billing/checkout" method="POST">
      <input type="hidden" name="priceKey" value={priceKey} />
      <button
        type="submit"
        className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
          highlight
            ? 'bg-background text-foreground hover:bg-background/90'
            : 'border border-border hover:bg-accent'
        }`}
        onClick={async (e) => {
          e.preventDefault()
          const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceKey }),
          })
          const { url } = await res.json()
          if (url) window.location.href = url
        }}
      >
        Start free trial
      </button>
    </form>
  )
}

function ManageButton({ highlight }: { highlight: boolean }) {
  return (
    <button
      type="button"
      className={`w-full rounded-lg py-2.5 text-sm font-medium transition-colors ${
        highlight
          ? 'bg-background text-foreground hover:bg-background/90'
          : 'border border-border hover:bg-accent'
      }`}
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
