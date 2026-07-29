'use client'

import { Crown, Zap, Building2, Check, CreditCard, X, Tag } from 'lucide-react'
import { useState } from 'react'
import type { PlanConfigRow } from '@/lib/db/schema'
import type { CurrencyConfig, CurrencyCode } from '@/lib/geo-currency'
import { CURRENCY_CONFIGS, formatPrice } from '@/lib/geo-currency'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  pro: Crown,
  team: Building2,
}

const PLAN_MONTHLY_KEYS: Record<string, string | null> = {
  free: null,
  pro: 'pro-monthly',
  team: 'team-monthly',
}

const CURRENCY_FLAGS: Partial<Record<CurrencyCode, string>> = {
  USD: '🇺🇸',
  INR: '🇮🇳',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  SGD: '🇸🇬',
  AED: '🇦🇪',
  JPY: '🇯🇵',
  BRL: '🇧🇷',
}

const SELECTOR_CURRENCIES: CurrencyCode[] = [
  'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'SGD', 'AED', 'JPY', 'BRL',
]

type ActivePromo = {
  id: string
  appliesToPlans: string[]
  originalPriceCents: number | null
  promoPriceCents: number | null
  expiresAt: string | null
  duration: string
  discountType: string
  discountValue: number
}

type Props = {
  currentPlan: string | null
  isSignedIn: boolean
  hasStripeSubscription: boolean
  hasRazorpaySubscription: boolean
  paymentGateway: 'stripe' | 'razorpay' | null
  activePromos: ActivePromo[]
  planConfigs: PlanConfigRow[]
  currency: CurrencyConfig
  countryCode: string | null
}

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
    document.body.appendChild(script)
  })
}

// Approximate conversion for promo prices (always USD cents → target currency)
function approxPromoPrice(usdCents: number, currency: CurrencyConfig): string {
  if (currency.code === 'USD') {
    return formatPrice(usdCents, currency)
  }
  const approxSmallestUnits = Math.round((usdCents / 100) * currency.approxUsdRate * currency.divisor)
  const prefix = currency.code === 'INR' ? '' : '≈'
  return prefix + formatPrice(approxSmallestUnits, currency)
}

export function PricingClient({
  currentPlan,
  isSignedIn,
  hasStripeSubscription,
  hasRazorpaySubscription,
  paymentGateway,
  activePromos,
  planConfigs,
  currency,
  countryCode,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyConfig>(currency)

  const plans = planConfigs
    .filter((p) => p.active)
    .map((p) => {
      const planRow = p as PlanConfigRow & { localePricesJson?: string }
      const localePrices = JSON.parse(planRow.localePricesJson ?? '{}') as Partial<Record<string, number>>
      const localeSmallestUnits = localePrices[selectedCurrency.code] ?? null
      const displayPrice = p.displayPriceCents === 0
        ? formatPrice(0, selectedCurrency)
        : formatPrice(localeSmallestUnits, selectedCurrency, p.displayPriceCents)

      return {
        key: p.planKey,
        name: p.displayName,
        price: displayPrice,
        period: p.priceSuffix,
        icon: PLAN_ICONS[p.planKey] ?? Zap,
        features: JSON.parse(p.features) as string[],
        monthlyKey: PLAN_MONTHLY_KEYS[p.planKey] ?? null,
        highlight: p.highlight,
        hasStripe: !!p.stripePriceId,
        hasRazorpay: !!p.razorpayPlanId,
        displayPriceCents: p.displayPriceCents,
      }
    })

  // Razorpay is primary when the selected currency routes to razorpay
  const razorpayIsPrimary = selectedCurrency.gateway === 'razorpay'

  function getPromoForPlan(monthlyKey: string | null): ActivePromo | null {
    if (!monthlyKey) return null
    return activePromos.find((p) => p.appliesToPlans.includes(monthlyKey)) ?? null
  }

  async function handleStripeUpgrade(priceKey: string, promoId?: string) {
    setLoading(`stripe-${priceKey}`)
    setError(null)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceKey,
          ...(promoId ? { promoCodeId: promoId } : {}),
          currency: selectedCurrency.code.toLowerCase(),
        }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Stripe checkout failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleRazorpayUpgrade(priceKey: string) {
    setLoading(`razorpay-${priceKey}`)
    setError(null)
    try {
      await loadRazorpayScript()

      const res = await fetch('/api/billing/razorpay/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceKey }),
      })
      const data = (await res.json()) as {
        subscriptionId?: string
        keyId?: string
        userEmail?: string
        userName?: string
        error?: string
      }
      if (!data.subscriptionId || !data.keyId) {
        setError(data.error ?? 'Failed to create Razorpay subscription.')
        setLoading(null)
        return
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Aruct Editor',
        description: 'Subscription',
        prefill: { email: data.userEmail, name: data.userName },
        theme: { color: '#000000' },
        handler: async (response: {
          razorpay_payment_id: string
          razorpay_subscription_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch('/api/billing/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })
          if (verifyRes.ok) {
            window.location.href = '/billing/success'
          } else {
            setError('Payment verified but activation failed. Contact support.')
          }
          setLoading(null)
        },
        modal: {
          ondismiss: () => setLoading(null),
        },
      })
      rzp.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Razorpay checkout failed.')
      setLoading(null)
    }
  }

  async function handleStripePortal() {
    setLoading('portal')
    setError(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = (await res.json()) as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error ?? 'Failed to open billing portal.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function handleRazorpayCancel() {
    if (!window.confirm('Cancel your Razorpay subscription? Access continues until the period ends.')) return
    setLoading('rzp-cancel')
    setError(null)
    try {
      const res = await fetch('/api/billing/razorpay/cancel', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Failed to cancel subscription.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const btnClass = (highlight: boolean) =>
    `w-full rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 ${
      highlight
        ? 'bg-brand text-brand-foreground hover:opacity-90'
        : 'border border-border hover:bg-accent'
    }`

  const secondaryBtnClass = (_highlight: boolean) =>
    `w-full rounded-lg py-2 text-xs font-medium transition-colors disabled:opacity-60 border border-border text-muted-foreground hover:bg-accent`

  const showApproxNote =
    selectedCurrency.code !== 'USD' && selectedCurrency.code !== 'INR'

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-4xl text-foreground">Simple, transparent pricing</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Start free. Upgrade when you&apos;re ready to scale.
          </p>
        </div>

        {/* Currency selector */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="text-sm text-muted-foreground">Currency:</span>
          <select
            value={selectedCurrency.code}
            onChange={(e) => {
              const cfg = CURRENCY_CONFIGS[e.target.value as CurrencyCode]
              if (cfg) setSelectedCurrency(cfg)
            }}
            className="rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-brand/50"
          >
            {SELECTOR_CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {CURRENCY_FLAGS[code]} {code}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-destructive text-sm">
            <span className="flex-1 text-center">{error}</span>
            <button type="button" onClick={() => setError(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center text-muted-foreground">
            <p>No pricing plans configured. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.key
              const Icon = plan.icon
              const promo = getPromoForPlan(plan.monthlyKey)
              const hasPromo = !!promo && !!promo.promoPriceCents && !!promo.originalPriceCents

              // Determine button order: razorpay-primary when gateway routes there and plan supports it
              const showRazorpayPrimary = razorpayIsPrimary && plan.hasRazorpay

              return (
                <div
                  key={plan.key}
                  className={`relative flex flex-col rounded-2xl border p-6 transition-shadow ${
                    plan.highlight
                      ? 'border-brand bg-background ring-2 ring-brand/20 shadow-xl'
                      : 'border-border bg-background hover:shadow-md'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-brand px-3 py-1 text-brand-foreground text-xs font-bold">
                        Most popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <h2 className="font-bold text-xl">{plan.name}</h2>
                      {isCurrent && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            plan.highlight
                              ? 'bg-brand/20 text-brand'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          Current
                        </span>
                      )}
                      {hasPromo && (
                        <span className="ml-auto flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-[10px] font-bold text-success">
                          <Tag className="h-3 w-3" />
                          Offer
                        </span>
                      )}
                    </div>

                    {hasPromo && promo ? (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm line-through text-muted-foreground">
                            {approxPromoPrice(promo.originalPriceCents!, selectedCurrency)}
                          </span>
                          <span className="font-bold text-3xl">
                            {approxPromoPrice(promo.promoPriceCents!, selectedCurrency)}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 text-success">
                          first month, then {approxPromoPrice(promo.originalPriceCents!, selectedCurrency)}{plan.period}
                        </p>
                        {promo.expiresAt && (
                          <p className="text-[11px] mt-0.5 text-muted-foreground">
                            Offer ends in {daysUntil(promo.expiresAt)} days
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-3xl">{plan.price}</span>
                        <span className="text-sm text-muted-foreground">
                          {plan.period}
                        </span>
                      </div>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plan.key === 'free' ? (
                    <a
                      href={isSignedIn ? '/' : '/signup'}
                      className={btnClass(plan.highlight) + ' block text-center'}
                    >
                      {isSignedIn ? 'Open editor' : 'Get started free'}
                    </a>
                  ) : isCurrent && hasStripeSubscription ? (
                    <button
                      type="button"
                      disabled={loading === 'portal'}
                      onClick={handleStripePortal}
                      className={btnClass(plan.highlight)}
                    >
                      {loading === 'portal' ? 'Loading…' : 'Manage subscription'}
                    </button>
                  ) : isCurrent && hasRazorpaySubscription ? (
                    <button
                      type="button"
                      disabled={loading === 'rzp-cancel'}
                      onClick={() => void handleRazorpayCancel()}
                      className={btnClass(plan.highlight)}
                    >
                      {loading === 'rzp-cancel' ? 'Cancelling…' : 'Cancel subscription'}
                    </button>
                  ) : !isSignedIn ? (
                    <a
                      href="/signup?next=/pricing"
                      className={btnClass(plan.highlight) + ' block text-center'}
                    >
                      Start free trial
                    </a>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {/* Primary button — razorpay or stripe depending on detected currency */}
                      {showRazorpayPrimary ? (
                        <>
                          <button
                            type="button"
                            disabled={!!loading}
                            onClick={() => plan.monthlyKey && void handleRazorpayUpgrade(plan.monthlyKey)}
                            className={btnClass(plan.highlight)}
                          >
                            {loading === `razorpay-${plan.monthlyKey}`
                              ? 'Loading…'
                              : hasPromo && promo
                                ? `Pay — ${approxPromoPrice(promo.promoPriceCents!, selectedCurrency)}`
                                : `Pay ${selectedCurrency.symbol} (Razorpay)`}
                          </button>
                          {plan.hasStripe && (
                            <button
                              type="button"
                              disabled={!!loading}
                              onClick={() => plan.monthlyKey && void handleStripeUpgrade(plan.monthlyKey, promo?.id)}
                              className={secondaryBtnClass(plan.highlight)}
                            >
                              <span className="flex items-center justify-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" />
                                {loading === `stripe-${plan.monthlyKey}`
                                  ? 'Loading…'
                                  : 'Pay with Card (Stripe)'}
                              </span>
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          {plan.hasStripe && (
                            <button
                              type="button"
                              disabled={!!loading}
                              onClick={() => plan.monthlyKey && void handleStripeUpgrade(plan.monthlyKey, promo?.id)}
                              className={btnClass(plan.highlight)}
                            >
                              <span className="flex items-center justify-center gap-2">
                                <CreditCard className="h-3.5 w-3.5" />
                                {loading === `stripe-${plan.monthlyKey}`
                                  ? 'Loading…'
                                  : hasPromo && promo
                                    ? `Pay with Card — ${approxPromoPrice(promo.promoPriceCents!, selectedCurrency)}`
                                    : 'Pay with Card'}
                              </span>
                            </button>
                          )}
                          {plan.hasRazorpay && (
                            <button
                              type="button"
                              disabled={!!loading}
                              onClick={() => plan.monthlyKey && void handleRazorpayUpgrade(plan.monthlyKey)}
                              className={plan.hasStripe ? secondaryBtnClass(plan.highlight) : btnClass(plan.highlight)}
                            >
                              {loading === `razorpay-${plan.monthlyKey}`
                                ? 'Loading…'
                                : hasPromo && promo
                                  ? `Pay — ${approxPromoPrice(promo.promoPriceCents!, selectedCurrency)}`
                                  : '₹ Pay with Razorpay'}
                            </button>
                          )}
                        </>
                      )}
                      {!plan.hasStripe && !plan.hasRazorpay && (
                        <p className="text-center text-muted-foreground text-xs py-2">
                          Payment not yet configured. Contact us to upgrade.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {showApproxNote && (
          <p className="mt-6 text-center text-muted-foreground text-xs">
            Prices shown in {selectedCurrency.code} are approximate. You&apos;ll be charged in USD via Stripe.
          </p>
        )}

        <p className="mt-4 text-center text-muted-foreground text-sm">
          All plans include 14-day free trial. No credit card required to start.
        </p>
      </div>
    </div>
  )
}
