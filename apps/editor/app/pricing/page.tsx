import { getSession } from '@/lib/auth-server'
import { AppShell } from '@/components/app-shell'
import { PricingClient } from './pricing-client'

export default async function PricingPage() {
  const session = await getSession()
  return (
    <AppShell>
      <PricingClient
        currentPlan={session?.plan ?? null}
        isSignedIn={!!session}
      />
    </AppShell>
  )
}
