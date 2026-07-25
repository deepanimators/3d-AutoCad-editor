'use client'

import { Crown, Zap, Building2, Check } from 'lucide-react'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    icon: Zap,
    features: [
      'Up to 5 scenes',
      'JSON export',
      'Community support',
      'Basic 3D editor',
    ],
    monthlyKey: null,
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    price: '$19',
    period: '/month',
    icon: Crown,
    features: [
      'Unlimited scenes',
      'GLB & JSON export',
      'MCP server access',
      'Priority support',
      '14-day free trial',
    ],
    monthlyKey: 'pro-monthly',
    highlight: true,
  },
  {
    key: 'team',
    name: 'Team',
    price: '$79',
    period: '/seat/month',
    icon: Building2,
    features: [
      'Everything in Pro',
      'IFC export',
      'Real-time collaboration',
      'SSO / SAML',
      'Audit log',
      '14-day free trial',
    ],
    monthlyKey: 'team-monthly',
    highlight: false,
  },
] as const

type Props = {
  currentPlan: 'free' | 'pro' | 'team' | null
  isSignedIn: boolean
}

export function PricingClient({ currentPlan, isSignedIn }: Props) {
  async function handleUpgrade(priceKey: string) {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceKey }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  async function handlePortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="font-bold text-4xl text-foreground">Simple, transparent pricing</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Start free. Upgrade when you're ready to scale.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = currentPlan === plan.key
            const Icon = plan.icon

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight
                    ? 'border-foreground bg-foreground text-background shadow-2xl'
                    : 'border-border bg-background'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-3 py-1 text-white text-xs font-bold">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <h2 className="font-bold text-xl">{plan.name}</h2>
                    {isCurrent && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        plan.highlight ? 'bg-background/20 text-background' : 'bg-muted text-muted-foreground'
                      }`}>
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-3xl">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="mb-8 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className={`h-4 w-4 shrink-0 ${plan.highlight ? 'text-background/80' : 'text-green-600'}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {plan.key === 'free' ? (
                  <a
                    href={isSignedIn ? '/' : '/signup'}
                    className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : 'border border-border hover:bg-accent'
                    }`}
                  >
                    {isSignedIn ? 'Open editor' : 'Get started free'}
                  </a>
                ) : isCurrent ? (
                  <button
                    type="button"
                    onClick={handlePortal}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : 'border border-border hover:bg-accent'
                    }`}
                  >
                    Manage subscription
                  </button>
                ) : !isSignedIn ? (
                  <a
                    href="/signup?next=/pricing"
                    className={`block rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : 'border border-border hover:bg-accent'
                    }`}
                  >
                    Start free trial
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => plan.monthlyKey && handleUpgrade(plan.monthlyKey)}
                    className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                      plan.highlight
                        ? 'bg-background text-foreground hover:bg-background/90'
                        : 'border border-border hover:bg-accent'
                    }`}
                  >
                    Start 14-day free trial
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <p className="mt-8 text-center text-muted-foreground text-sm">
          All plans include 14-day free trial. No credit card required to start.
        </p>
      </div>
    </div>
  )
}
