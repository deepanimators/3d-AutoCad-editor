import { getSession } from '@/lib/auth-server'
import { PricingClient } from './pricing-client'

export default async function PricingPage() {
  const session = await getSession()
  return (
    <PricingClient
      currentPlan={session?.plan ?? null}
      isSignedIn={!!session}
    />
  )
}
