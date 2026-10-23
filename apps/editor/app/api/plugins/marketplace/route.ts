import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { pluginRegistry } from '@/lib/db/schema'
import { eq, and, like, sql } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured') === 'true'

  const conditions = [eq(pluginRegistry.status, 'approved')]
  if (category && category !== 'all') {
    conditions.push(eq(pluginRegistry.category, category as typeof pluginRegistry.$inferSelect['category']))
  }
  if (featured) conditions.push(eq(pluginRegistry.featured, true))
  if (search) conditions.push(like(pluginRegistry.name, `%${search}%`))

  const plugins = await db
    .select()
    .from(pluginRegistry)
    .where(and(...conditions))
    .orderBy(sql`${pluginRegistry.featured} desc, ${pluginRegistry.installCount} desc`)
    .limit(100)

  return NextResponse.json({ plugins })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, slug, description, authorName, authorUrl, version, manifestUrl, iconUrl, category, tags } = body

  if (!name || !slug || !description || !authorName || !version || !manifestUrl) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const [plugin] = await db
    .insert(pluginRegistry)
    .values({
      id: randomUUID(),
      name,
      slug,
      description,
      authorName,
      authorUrl,
      version,
      manifestUrl,
      iconUrl,
      category: category ?? 'other',
      tags: JSON.stringify(tags ?? []),
      status: 'pending',
      submittedBy: user.id,
    })
    .returning()

  return NextResponse.json({ plugin }, { status: 201 })
}
