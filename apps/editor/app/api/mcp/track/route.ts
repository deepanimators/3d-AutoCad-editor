import { type NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({
  userId: z.string().min(1),
  type: z.enum(['generation', 'vision']),
  token: z.string().min(1),
})

function isSameMonth(dateStr: string | null): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedToken = process.env.ARUCT_MCP_HTTP_TOKEN
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { userId, type } = parsed.data
  const now = new Date().toISOString()

  const [user] = await db.select({
    aiGenerationsThisMonth: users.aiGenerationsThisMonth,
    aiGenerationsResetAt: users.aiGenerationsResetAt,
    visionCallsThisMonth: users.visionCallsThisMonth,
    visionCallsResetAt: users.visionCallsResetAt,
    plan: users.plan,
  }).from(users).where(eq(users.id, userId))

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  if (type === 'generation') {
    const resetNeeded = !isSameMonth(user.aiGenerationsResetAt)
    await db.update(users).set({
      aiGenerationsThisMonth: resetNeeded ? 1 : sql`${users.aiGenerationsThisMonth} + 1`,
      aiGenerationsResetAt: resetNeeded ? now : user.aiGenerationsResetAt,
      updatedAt: now,
    }).where(eq(users.id, userId))

    const current = resetNeeded ? 1 : (user.aiGenerationsThisMonth + 1)
    return NextResponse.json({ tracked: true, count: current })
  } else {
    const resetNeeded = !isSameMonth(user.visionCallsResetAt)
    await db.update(users).set({
      visionCallsThisMonth: resetNeeded ? 1 : sql`${users.visionCallsThisMonth} + 1`,
      visionCallsResetAt: resetNeeded ? now : user.visionCallsResetAt,
      updatedAt: now,
    }).where(eq(users.id, userId))

    const current = resetNeeded ? 1 : (user.visionCallsThisMonth + 1)
    return NextResponse.json({ tracked: true, count: current })
  }
}
