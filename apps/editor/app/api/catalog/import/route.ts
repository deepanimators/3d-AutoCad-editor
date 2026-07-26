import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { globalModels } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

const S3_BASE = 'https://assets.aruct.com'

const schema = z.object({
  source: z.enum(['tripo3d', 'sketchfab', 'polyhaven', 'polypizza', 'smithsonian']),
  sourceId: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  glbUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  license: z.string().min(1),
  attribution: z.string().optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { source, sourceId, name, description, glbUrl, thumbnailUrl, license, attribution, tags, category } = parsed.data

  const existing = await db.select().from(globalModels)
    .where(and(eq(globalModels.source, source), eq(globalModels.sourceId, sourceId)))
    .limit(1)

  const existingRow = existing[0]
  if (existingRow) {
    const m = existingRow
    return NextResponse.json({
      model: {
        ...m,
        glbUrl: `${S3_BASE}/${m.s3Key}`,
        thumbnailUrl: m.s3Thumbnail ? `${S3_BASE}/${m.s3Thumbnail}` : null,
        isNew: new Date(m.addedAt) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        tags: (() => { try { return JSON.parse(m.tags) as string[] } catch { return [] } })(),
      },
    })
  }

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) +
    '-' +
    Math.random().toString(36).slice(2, 8)

  const id = crypto.randomUUID()

  const rows = await db.insert(globalModels).values({
    id,
    slug,
    name,
    description,
    source,
    sourceId,
    sourceUrl: glbUrl,
    license,
    attribution,
    s3Key: glbUrl,
    s3Thumbnail: thumbnailUrl,
    tags: JSON.stringify(tags),
    category,
    addedBy: session.id,
  }).returning()

  const inserted = rows[0]
  if (!inserted) {
    return NextResponse.json({ error: 'Insert failed' }, { status: 500 })
  }

  return NextResponse.json({
    model: {
      ...inserted,
      glbUrl: `${S3_BASE}/${inserted.s3Key}`,
      thumbnailUrl: inserted.s3Thumbnail ? `${S3_BASE}/${inserted.s3Thumbnail}` : null,
      isNew: true,
      tags,
    },
  }, { status: 201 })
}
