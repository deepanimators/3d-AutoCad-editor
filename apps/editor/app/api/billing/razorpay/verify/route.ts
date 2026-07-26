import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { getRazorpay, verifyRazorpaySignature, resolvePlanFromRazorpayPlanId } from '@/lib/razorpay'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const schema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = parsed.data

  const valid = verifyRazorpaySignature({
    paymentId: razorpay_payment_id,
    subscriptionId: razorpay_subscription_id,
    signature: razorpay_signature,
  })
  if (!valid) return NextResponse.json({ error: 'invalid_signature' }, { status: 400 })

  const subscription = (await getRazorpay().subscriptions.fetch(razorpay_subscription_id)) as unknown as Record<string, unknown>
  const planId = subscription.plan_id as string | undefined
  const plan = resolvePlanFromRazorpayPlanId(planId)

  const currentPeriodEnd = subscription.current_end as number | undefined
  const planExpiresAt = currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null

  await db.update(users).set({
    plan,
    razorpaySubscriptionId: razorpay_subscription_id,
    paymentGateway: 'razorpay',
    subscriptionStatus: 'active',
    planExpiresAt,
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, session.id))

  await logAction({
    userId: session.id,
    action: 'subscription.activated',
    resourceType: 'subscription',
    resourceId: razorpay_subscription_id,
    request,
  })

  return NextResponse.json({ plan })
}
