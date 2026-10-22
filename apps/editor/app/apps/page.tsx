import type { Metadata } from 'next'
import { getSession } from '@/lib/auth-server'
import { AppsClient } from './apps-client'

export const metadata: Metadata = {
  title: 'Aruct Universe',
  description: 'Every tool an architect needs, in one place. Design, convert, render, and collaborate across the full Aruct Suite.',
}

export default async function AppsPage() {
  // Session is fetched but not required — page is publicly accessible.
  // It can be threaded into AppsClient later (e.g. for personalised CTAs).
  await getSession()

  return <AppsClient />
}
