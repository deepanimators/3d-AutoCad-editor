import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { AppShell } from '@/components/app-shell'
import { DCCBridgeClient } from './dcc-bridge-client'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'DCC Bridge — Aruct Editor',
}

export default async function DCCBridgePage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/dcc-bridge')

  return (
    <AppShell>
      <DCCBridgeClient />
    </AppShell>
  )
}
