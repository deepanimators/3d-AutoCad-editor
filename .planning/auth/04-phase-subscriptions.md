# Phase 3: Subscriptions (Stripe)

## Goal

Let users upgrade from Free → Pro → Team, pay via Stripe, and have their plan enforced in real time.

After this phase:
- `/pricing` page with plan comparison and "Upgrade" buttons
- Stripe Checkout for payment collection
- Webhooks update `users.plan` immediately when subscription status changes
- Stripe Customer Portal for self-serve plan management and cancellation
- Pro/Team trial: 14 days free, no card required for first 14 days

---

## Install

```bash
bun add stripe @stripe/stripe-js
```

---

## Environment Variables

```bash
# Stripe
STRIPE_SECRET_KEY="sk_live_..."          # sk_test_... in dev
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_YEARLY_PRICE_ID="price_..."
STRIPE_TEAM_MONTHLY_PRICE_ID="price_..."  # per-seat
STRIPE_TEAM_YEARLY_PRICE_ID="price_..."   # per-seat
```

---

## Stripe Products Setup (One-Time)

In Stripe Dashboard or via script:

```
Product: "Arch Construct Pro"
  Prices:
    - $29.00 / month (recurring) → STRIPE_PRO_MONTHLY_PRICE_ID
    - $290.00 / year (recurring) → STRIPE_PRO_YEARLY_PRICE_ID
  Trial: 14 days

Product: "Arch Construct Team"
  Prices:
    - $79.00 / month / seat (recurring, per-quantity) → STRIPE_TEAM_MONTHLY_PRICE_ID
    - $790.00 / year / seat (recurring, per-quantity) → STRIPE_TEAM_YEARLY_PRICE_ID
  Trial: 14 days
```

---

## Stripe Client (Server-Only)

`apps/editor/lib/stripe.ts`:

```typescript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30',
})
```

---

## Checkout Flow

### API Route — Create Checkout Session

`apps/editor/app/api/billing/checkout/route.ts`:

```typescript
import { stripe } from '@/lib/stripe'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const PRICE_MAP: Record<string, string> = {
  'pro-monthly': process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  'pro-yearly': process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  'team-monthly': process.env.STRIPE_TEAM_MONTHLY_PRICE_ID!,
  'team-yearly': process.env.STRIPE_TEAM_YEARLY_PRICE_ID!,
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { priceKey, seats = 1 } = await request.json()
  const priceId = PRICE_MAP[priceKey]
  if (!priceId) return Response.json({ error: 'invalid_price' }, { status: 400 })

  // Get or create Stripe customer
  const [user] = await db.select().from(users).where(eq(users.id, session.user.id))
  let customerId = user.stripeCustomerId

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: session.user.name,
      metadata: { userId: session.user.id },
    })
    customerId = customer.id
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, session.user.id))
  }

  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: seats }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: session.user.id },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    allow_promotion_codes: true,
    customer_update: { address: 'auto' },
    automatic_tax: { enabled: true },
  })

  return Response.json({ url: checkout.url })
}
```

### Client — Redirect to Checkout

```typescript
async function handleUpgrade(priceKey: string) {
  const res = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceKey }),
  })
  const { url } = await res.json()
  window.location.href = url
}
```

---

## Stripe Webhook Handler

`apps/editor/app/api/billing/webhook/route.ts`:

```typescript
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// CRITICAL: Must read raw body before any parsing
export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'invalid_signature' }, { status: 400 })
  }

  await handleStripeEvent(event)
  return Response.json({ received: true })
}

async function handleStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.trial_will_end': {
      const sub = event.data.object as Stripe.Subscription
      await syncSubscription(sub)
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await downgradeUser(sub)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await markPaymentFailed(invoice)
      break
    }
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata.userId
  if (!userId) return

  const priceId = sub.items.data[0]?.price.id
  const plan = resolvePlan(priceId)

  await db.update(users).set({
    plan,
    stripeSubscriptionId: sub.id,
    subscriptionStatus: sub.status,
    planExpiresAt: sub.current_period_end
      ? new Date(sub.current_period_end * 1000)
      : null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId))
}

async function downgradeUser(sub: Stripe.Subscription) {
  const userId = sub.metadata.userId
  if (!userId) return

  await db.update(users).set({
    plan: 'free',
    stripeSubscriptionId: null,
    subscriptionStatus: 'canceled',
    planExpiresAt: null,
    updatedAt: new Date(),
  }).where(eq(users.id, userId))
}

async function markPaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId))
  if (!user) return
  await db.update(users).set({ subscriptionStatus: 'past_due' }).where(eq(users.id, user.id))
}

function resolvePlan(priceId: string | undefined): 'free' | 'pro' | 'team' {
  if (!priceId) return 'free'
  if ([process.env.STRIPE_PRO_MONTHLY_PRICE_ID, process.env.STRIPE_PRO_YEARLY_PRICE_ID].includes(priceId)) return 'pro'
  if ([process.env.STRIPE_TEAM_MONTHLY_PRICE_ID, process.env.STRIPE_TEAM_YEARLY_PRICE_ID].includes(priceId)) return 'team'
  return 'free'
}
```

---

## Billing Portal (Self-Serve)

`apps/editor/app/api/billing/portal/route.ts`:

```typescript
export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id))
  if (!user.stripeCustomerId) {
    return Response.json({ error: 'no_subscription' }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
  })

  return Response.json({ url: portalSession.url })
}
```

Billing portal allows users to:
- View invoices
- Update payment method
- Change plan (upgrade/downgrade)
- Cancel subscription

---

## Pricing Page

`apps/editor/app/pricing/page.tsx` — Server Component that shows plan cards.

Key behaviours:
- If user is on Free: "Upgrade to Pro" and "Upgrade to Team" buttons active
- If user is on Pro: "Current plan" badge on Pro, "Upgrade to Team" active, "Manage subscription" link
- If user is not signed in: buttons go to `/signup?next=/pricing`

---

## Account / Billing Page

`apps/editor/app/account/page.tsx`:

```
Current Plan: Pro (Active)
Next billing: Aug 15, 2026 — $29.00

[Manage subscription →]   ← opens Stripe portal
[Upgrade to Team →]
```

---

## Local Webhook Testing

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to local
stripe listen --forward-to localhost:3002/api/billing/webhook
```

---

## Verify Success

- [ ] `/pricing` renders all 3 plans for signed-in user
- [ ] "Upgrade to Pro" → redirects to Stripe Checkout with 14-day trial
- [ ] After checkout success → `users.plan` = 'pro' in DB
- [ ] `customer.subscription.deleted` webhook → `users.plan` = 'free'
- [ ] Pro user → scene limit gone (can create 6th scene)
- [ ] Free user → `POST /api/scenes` after 5 scenes → 402 with `upgrade: '/pricing'`
- [ ] "Manage subscription" → opens Stripe portal
- [ ] Payment failure → `subscriptionStatus` = 'past_due', feature gates still check for `active | trialing`

---

## Grace Period for Past-Due

In `feature-gates.ts`, treat `past_due` as still active for 7 days:

```typescript
export function isPlanActive(user: User): boolean {
  const activeStatuses = ['active', 'trialing']
  if (activeStatuses.includes(user.subscriptionStatus ?? '')) return true
  // 7-day grace for past_due
  if (user.subscriptionStatus === 'past_due') {
    // Stripe will retry payment; don't cut off access immediately
    return true  // or check against last_payment_date + 7 days
  }
  return false
}
```
