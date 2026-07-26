import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, coupons, planConfig } from '@/lib/db/schema'
import { eq, and, or, isNull, gt } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { PricingClient } from './pricing-client'

export const dynamic = 'force-dynamic'

export default async function PricingPage() {
  const session = await getSession()
  let hasStripeSubscription = false
  let hasRazorpaySubscription = false
  let paymentGateway: 'stripe' | 'razorpay' | null = null

  if (session) {
    const [user] = await db
      .select({
        stripeCustomerId: users.stripeCustomerId,
        razorpaySubscriptionId: users.razorpaySubscriptionId,
        paymentGateway: users.paymentGateway,
      })
      .from(users)
      .where(eq(users.id, session.id))

    hasStripeSubscription = !!user?.stripeCustomerId
    hasRazorpaySubscription = !!user?.razorpaySubscriptionId
    paymentGateway = user?.paymentGateway ?? null
  }

  const now = new Date().toISOString()
  const activePromos = await db
    .select({
      id: coupons.id,
      appliesToPlans: coupons.appliesToPlans,
      originalPriceCents: coupons.originalPriceCents,
      promoPriceCents: coupons.promoPriceCents,
      expiresAt: coupons.expiresAt,
      duration: coupons.duration,
      discountType: coupons.discountType,
      discountValue: coupons.discountValue,
    })
    .from(coupons)
    .where(and(eq(coupons.active, true), or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now))))

  const parsedPromos = activePromos.map((p) => ({
    ...p,
    appliesToPlans: JSON.parse(p.appliesToPlans) as string[],
  }))

  const dbPlanConfig = await db.select().from(planConfig).where(eq(planConfig.active, true))

  return (
    <AppShell>
      <PricingClient
        currentPlan={session?.plan ?? null}
        isSignedIn={!!session}
        hasStripeSubscription={hasStripeSubscription}
        hasRazorpaySubscription={hasRazorpaySubscription}
        paymentGateway={paymentGateway}
        activePromos={parsedPromos}
        planConfigs={dbPlanConfig}
      />
    </AppShell>
  )
}
