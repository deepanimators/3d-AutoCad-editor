import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { razorpay } from '@/lib/razorpay'
import { logAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const [user] = await db.select().from(users).where(eq(users.id, session.id))
  if (!user?.razorpaySubscriptionId) {
    return NextResponse.json({ error: 'no_subscription' }, { status: 400 })
  }

  await razorpay.subscriptions.cancel(user.razorpaySubscriptionId, false)

  await db.update(users).set({
    subscriptionStatus: 'canceled',
    updatedAt: new Date().toISOString(),
  }).where(eq(users.id, session.id))

  await logAction({
    userId: session.id,
    action: 'subscription.cancelled',
    resourceType: 'subscription',
    resourceId: user.razorpaySubscriptionId,
    request,
  })

  return NextResponse.json({ ok: true })
}
