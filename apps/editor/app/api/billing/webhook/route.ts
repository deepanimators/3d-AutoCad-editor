import { stripe, resolvePlan } from '@/lib/stripe'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') ?? ''

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
      await syncSubscription(event.data.object as Stripe.Subscription)
      break
    }
    case 'customer.subscription.deleted': {
      await downgradeUser(event.data.object as Stripe.Subscription)
      break
    }
    case 'invoice.payment_failed': {
      await markPaymentFailed(event.data.object as Stripe.Invoice)
      break
    }
  }
}

async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata.userId
  if (!userId) return

  const firstItem = sub.items.data[0]
  const priceId = firstItem?.price.id
  const plan = resolvePlan(priceId)
  const periodEnd = firstItem?.current_period_end

  await db.update(users).set({
    plan,
    stripeSubscriptionId: sub.id,
    subscriptionStatus: sub.status,
    planExpiresAt: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updatedAt: new Date().toISOString(),
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
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, userId))
}

async function markPaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.stripeCustomerId, customerId))
  if (!user) return
  await db.update(users).set({ subscriptionStatus: 'past_due' }).where(eq(users.id, user.id))
}
