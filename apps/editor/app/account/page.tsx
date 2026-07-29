import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getSceneLimit, getAIGenerationLimit, getVisionLimit } from '@/lib/feature-gates'
import { AppShell } from '@/components/app-shell'
import { AccountClient } from './account-client'

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your Aruct account, billing, and subscription.',
}

export default async function AccountPage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/account')

  const [row] = await db
    .select({
      aiGenerationsThisMonth: users.aiGenerationsThisMonth,
      aiGenerationsResetAt: users.aiGenerationsResetAt,
      visionCallsThisMonth: users.visionCallsThisMonth,
    })
    .from(users)
    .where(eq(users.id, session.id))

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
        aiUsage={{
          generationsUsed: row?.aiGenerationsThisMonth ?? 0,
          generationsLimit: getAIGenerationLimit(session),
          visionUsed: row?.visionCallsThisMonth ?? 0,
          visionLimit: getVisionLimit(session),
          resetAt: row?.aiGenerationsResetAt ?? null,
        }}
      />
    </AppShell>
  )
}
