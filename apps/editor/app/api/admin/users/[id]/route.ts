import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { z } from 'zod'

const schema = z.object({
  role: z.enum(['user', 'admin']).optional(),
  plan: z.enum(['free', 'pro', 'team']).optional(),
  subscriptionStatus: z.enum(['active', 'trialing', 'past_due', 'canceled']).nullable().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() }
  if (parsed.data.role !== undefined) updates.role = parsed.data.role
  if (parsed.data.plan !== undefined) updates.plan = parsed.data.plan
  if (parsed.data.subscriptionStatus !== undefined) updates.subscriptionStatus = parsed.data.subscriptionStatus

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, id))
    .returning({ id: users.id, role: users.role, plan: users.plan, subscriptionStatus: users.subscriptionStatus })

  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  return NextResponse.json(updated)
}
