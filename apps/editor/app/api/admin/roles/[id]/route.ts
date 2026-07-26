import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users, roles } from '@/lib/db/schema'
import { ALL_PERMISSIONS } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

const updateSchema = z.object({
  name: z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  description: z.string().min(1).optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const [role] = await db.select().from(roles).where(eq(roles.id, id))
  if (!role) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (role.isSystem) return NextResponse.json({ error: 'cannot_modify_system_role' }, { status: 400 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body', details: parsed.error.flatten() }, { status: 400 })

  const patch: Record<string, unknown> = {}
  if (parsed.data.name !== undefined) patch.name = parsed.data.name
  if (parsed.data.description !== undefined) patch.description = parsed.data.description
  if (parsed.data.permissions !== undefined) patch.permissions = JSON.stringify(parsed.data.permissions)

  const [updated] = await db.update(roles).set(patch).where(eq(roles.id, id)).returning()
  return NextResponse.json(updated)
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const [role] = await db.select().from(roles).where(eq(roles.id, id))
  if (!role) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (role.isSystem) return NextResponse.json({ error: 'cannot_delete_system_role' }, { status: 400 })

  const usersWithRole = await db.select({ id: users.id }).from(users).where(eq(users.role, role.name))
  if (usersWithRole.length > 0) {
    return NextResponse.json(
      { error: 'role_in_use', message: `${usersWithRole.length} user(s) have this role. Reassign them before deleting.` },
      { status: 409 }
    )
  }

  await db.delete(roles).where(and(eq(roles.id, id), eq(roles.isSystem, false)))
  return NextResponse.json({ ok: true })
}
