import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { listPolyHavenModels, getPolyHavenFiles, getBestGltfUrl } from '@/lib/free-sources/poly-haven'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const toName = (id: string) =>
  id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  let limit = 50
  try {
    const body = await request.json()
    if (typeof body.limit === 'number') {
      limit = Math.min(body.limit, 200)
    }
  } catch {
    // body is optional — use defaults
  }

  const assets = await listPolyHavenModels()
  const ids = Object.keys(assets).slice(0, limit)

  let inserted = 0
  let skipped = 0
  let errors = 0

  const BATCH = 10
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const existing = await db
          .select({ id: globalModels.id })
          .from(globalModels)
          .where(and(eq(globalModels.source, 'polyhaven'), eq(globalModels.sourceId, id)))
          .limit(1)

        if (existing.length > 0) {
          skipped++
          return
        }

        const files = await getPolyHavenFiles(id)
        const glbUrl = getBestGltfUrl(files)
        if (!glbUrl) {
          skipped++
          return
        }

        const asset = assets[id]
        await db.insert(globalModels).values({
          id: crypto.randomUUID(),
          slug: id.replace(/_/g, '-').slice(0, 50),
          name: toName(id),
          source: 'polyhaven',
          sourceId: id,
          sourceUrl: glbUrl,
          license: 'CC0',
          s3Key: glbUrl,
          tags: JSON.stringify(asset.tags ?? []),
          category: asset.categories?.[0] ?? null,
          addedBy: 'system',
        })
        inserted++
      })
    )

    for (const result of results) {
      if (result.status === 'rejected') {
        console.error('[ingest-polyhaven] error:', result.reason)
        errors++
      }
    }
  }

  return NextResponse.json({ inserted, skipped, errors, total: Object.keys(assets).length })
}
