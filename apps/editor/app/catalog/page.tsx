import type { Metadata } from 'next'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { count, desc } from 'drizzle-orm'
import { AppShell } from '@/components/app-shell'
import { CatalogClient } from './catalog-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Catalog',
  description: 'Browse thousands of 3D models, furniture, and architectural assets.',
}

const S3_BASE = process.env.CATALOG_ASSETS_BASE_URL ?? ''

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
    const [rows, countRows] = await Promise.all([
      db.select().from(globalModels).orderBy(desc(globalModels.addedAt)).limit(24),
      db.select({ total: count() }).from(globalModels),
    ])
    totalModels = countRows[0]?.total ?? 0
    const cutoff = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    initialModels = rows.map((m) => ({
      id: m.id,
      slug: m.slug,
      name: m.name,
      description: m.description,
      source: m.source,
      license: m.license,
      attribution: m.attribution,
      glbUrl: m.s3Key.startsWith('http') ? m.s3Key : `${S3_BASE}/${m.s3Key}`,
      thumbnailUrl: m.s3Thumbnail
        ? m.s3Thumbnail.startsWith('http') ? m.s3Thumbnail : `${S3_BASE}/${m.s3Thumbnail}`
        : null,
      isNew: new Date(m.addedAt) > cutoff,
      addedAt: m.addedAt,
      tags: (() => { try { return JSON.parse(m.tags) as string[] } catch { return [] } })(),
      category: m.category,
      polyCount: m.polyCount,
    }))
  } catch {
    // serve empty state if DB query fails
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
