import { type NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { db } from '@/lib/db/client'
import { organizations, orgMembers } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

const createOrgSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/).optional(),
})

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 60)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  if (session.plan !== 'team' && session.role !== 'admin') {
    return NextResponse.json({ error: 'team_plan_required' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_request', details: 'body must be valid JSON' }, { status: 400 })
  }

  const parsed = createOrgSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_request', details: parsed.error.issues }, { status: 400 })
  }

  const slug = parsed.data.slug ?? slugify(parsed.data.name)
  if (!slug) {
    return NextResponse.json({ error: 'invalid_request', details: 'could not derive slug from name' }, { status: 400 })
  }

  const orgId = randomUUID()
  const memberId = randomUUID()

  try {
    const [org] = await db.insert(organizations).values({
      id: orgId,
      name: parsed.data.name,
      slug,
      ownerId: session.id,
    }).returning()

    await db.insert(orgMembers).values({
      id: memberId,
      orgId,
      userId: session.id,
      role: 'owner',
    })

    return NextResponse.json(org, { status: 201 })
  } catch (err) {
    const msg = (err as { message?: string })?.message ?? ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'slug_taken' }, { status: 409 })
    }
    return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  }
}
