import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { planConfig } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const rows = await db.select().from(planConfig).orderBy(planConfig.planKey)
  const parsed = rows.map((row) => ({
    ...row,
    features: JSON.parse(row.features) as string[],
  }))
  return NextResponse.json(parsed)
}
