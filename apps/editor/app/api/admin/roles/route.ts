import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { asc, desc } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { roles } from '@/lib/db/schema'
import { ALL_PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Name must be alphanumeric with underscores or hyphens'),
  description: z.string().min(1),
  permissions: z.array(z.enum(ALL_PERMISSIONS)),
})

const RESERVED_NAMES = ['admin', 'user']

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const rows = await db.select().from(roles).orderBy(desc(roles.isSystem), asc(roles.createdAt))
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 })

  const { name, description, permissions } = parsed.data

  if (RESERVED_NAMES.includes(name)) {
    return NextResponse.json({ error: 'reserved_name', message: `Role name '${name}' is reserved` }, { status: 400 })
  }

  const id = crypto.randomUUID()
  const [inserted] = await db.insert(roles).values({
    id,
    name,
    description,
    permissions: JSON.stringify(permissions),
    isSystem: false,
  }).returning()

  return NextResponse.json(inserted, { status: 201 })
}
