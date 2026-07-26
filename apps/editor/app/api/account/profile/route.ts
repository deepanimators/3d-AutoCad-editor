import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSessionFromRequest } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).max(100),
})

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const [updated] = await db
    .update(users)
    .set({ name: parsed.data.name, updatedAt: new Date().toISOString() })
    .where(eq(users.id, session.uid))
    .returning({ name: users.name })

  return NextResponse.json({ name: updated?.name })
}
