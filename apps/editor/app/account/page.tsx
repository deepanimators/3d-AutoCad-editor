import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { getSceneLimit } from '@/lib/feature-gates'
import { AppShell } from '@/components/app-shell'
import { AccountClient } from './account-client'

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/account')

  return (
    <AppShell>
      <AccountClient
        user={{
          name: session.name,
          email: session.email,
          plan: session.plan,
          role: session.role,
          subscriptionStatus: session.subscriptionStatus ?? null,
          planExpiresAt: session.planExpiresAt ?? null,
          stripeCustomerId: session.stripeCustomerId ?? null,
        }}
        sceneLimit={getSceneLimit(session)}
      />
    </AppShell>
  )
}
