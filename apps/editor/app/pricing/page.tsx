import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { PricingClient } from './pricing-client'

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

  return (
    <AppShell>
      <PricingClient
        currentPlan={session?.plan ?? null}
        isSignedIn={!!session}
        hasStripeSubscription={hasStripeSubscription}
        hasRazorpaySubscription={hasRazorpaySubscription}
        paymentGateway={paymentGateway}
      />
    </AppShell>
  )
}
