import { getSession } from '@/lib/auth-server'
import { AppShell } from '@/components/app-shell'
import { CatalogClient } from './catalog-client'

export const dynamic = 'force-dynamic'

type CatalogModel = {
  id: string
  slug: string
  name: string
  description: string | null
  source: string
  license: string
  attribution: string | null
  glbUrl: string
  thumbnailUrl: string | null
  isNew: boolean
  addedAt: string
  tags: string[]
  category: string | null
  polyCount: number | null
}

export default async function CatalogPage() {
  const session = await getSession()

  let initialModels: CatalogModel[] = []
  let totalModels = 0

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000')

    const res = await fetch(`${baseUrl}/api/catalog?limit=24`, {
      cache: 'no-store',
    })

    if (res.ok) {
      const data = (await res.json()) as { models: CatalogModel[]; total: number }
      initialModels = data.models
      totalModels = data.total
    }
  } catch {
    // serve empty state if catalog fetch fails
  }

  return (
    <AppShell>
      <CatalogClient
        initialModels={initialModels}
        totalModels={totalModels}
        isLoggedIn={!!session}
      />
    </AppShell>
  )
}
