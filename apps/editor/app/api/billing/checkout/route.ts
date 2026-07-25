import { stripe, PRICE_MAP } from '@/lib/stripe'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const { priceKey, seats = 1 } = await request.json()
  const priceId = PRICE_MAP[priceKey]
  if (!priceId) return Response.json({ error: 'invalid_price' }, { status: 400 })

  const [user] = await db.select().from(users).where(eq(users.id, session.id))
  let customerId = user?.stripeCustomerId ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      name: session.name,
      metadata: { userId: session.id },
    })
    customerId = customer.id
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, session.id))
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002'
  const checkout = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: seats }],
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: session.id },
    },
    success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
  })

  return Response.json({ url: checkout.url })
}
