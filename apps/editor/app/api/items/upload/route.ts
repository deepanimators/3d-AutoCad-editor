import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { customItems } from '@/lib/db/schema'
import { canUploadCustomItems } from '@/lib/feature-gates'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  glbUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  category: z.enum(['furniture', 'kitchen', 'bathroom', 'structure', 'other']).default('other'),
  orgId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canUploadCustomItems(session)) {
    return NextResponse.json({ error: 'Pro plan required to upload custom items' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 })
  }

  const { name, description, glbUrl, thumbnailUrl, tags, category, orgId } = parsed.data

  const [item] = await db.insert(customItems).values({
    id: crypto.randomUUID(),
    uploadedBy: session.id,
    orgId: orgId ?? null,
    name,
    description: description ?? null,
    glbUrl,
    thumbnailUrl: thumbnailUrl ?? null,
    tags: JSON.stringify(tags),
    category,
  }).returning()

  return NextResponse.json({ item }, { status: 201 })
}
