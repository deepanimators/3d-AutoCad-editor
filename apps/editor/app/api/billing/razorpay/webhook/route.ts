import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { verifyRazorpayWebhookSignature, resolvePlanFromRazorpayPlanId } from '@/lib/razorpay'
import { getAdminAuth } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })
  }

  let event: { event: string; payload: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody) as { event: string; payload: Record<string, unknown> }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const subscriptionPayload = (event.payload.subscription as { entity?: Record<string, unknown> })?.entity
  if (!subscriptionPayload) return NextResponse.json({ received: true })

  const subscriptionId = subscriptionPayload.id as string
  const notes = subscriptionPayload.notes as Record<string, string> | undefined
  const userId = notes?.userId

  switch (event.event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      if (!userId) break
      const planId = subscriptionPayload.plan_id as string | undefined
      const plan = resolvePlanFromRazorpayPlanId(planId)
      const currentEnd = subscriptionPayload.current_end as number | undefined
      await db.update(users).set({
        plan,
        razorpaySubscriptionId: subscriptionId,
        paymentGateway: 'razorpay',
        subscriptionStatus: 'active',
        planExpiresAt: currentEnd ? new Date(currentEnd * 1000).toISOString() : null,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, userId))
      try {
        const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId))
        if (row) await getAdminAuth().setCustomUserClaims(userId, { plan, role: row.role })
      } catch (err) {
        console.error('[razorpay webhook] setCustomUserClaims failed', err)
      }
      break
    }
    case 'subscription.cancelled':
    case 'subscription.completed': {
      if (!userId) break
      await db.update(users).set({
        plan: 'free',
        razorpaySubscriptionId: null,
        subscriptionStatus: 'canceled',
        planExpiresAt: null,
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, userId))
      try {
        const [row] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId))
        if (row) await getAdminAuth().setCustomUserClaims(userId, { plan: 'free', role: row.role })
      } catch (err) {
        console.error('[razorpay webhook] setCustomUserClaims failed', err)
      }
      break
    }
    case 'subscription.paused':
    case 'subscription.pending': {
      if (!userId) break
      await db.update(users).set({
        subscriptionStatus: event.event === 'subscription.paused' ? 'past_due' : 'trialing',
        updatedAt: new Date().toISOString(),
      }).where(eq(users.id, userId))
      break
    }
  }

  return NextResponse.json({ received: true })
}
