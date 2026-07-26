import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { getRazorpay, RAZORPAY_PLAN_MAP } from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

const schema = z.object({ priceKey: z.string().min(1) })

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  const planId = RAZORPAY_PLAN_MAP[parsed.data.priceKey]
  if (!planId) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.id, session.id))

  let customerId = user?.razorpayCustomerId ?? null
  if (!customerId) {
    const customer = await getRazorpay().customers.create({
      name: session.name,
      email: session.email,
      fail_existing: 0,
    })
    customerId = (customer as { id: string }).id
    await db.update(users).set({ razorpayCustomerId: customerId }).where(eq(users.id, session.id))
  }

  const subscription = await getRazorpay().subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
    quantity: 1,
    notes: { userId: session.id },
  })

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    userEmail: session.email,
    userName: session.name,
  })
}
