import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { getSceneRole, canWrite } from '@/lib/permissions'

export const dynamic = 'force-dynamic'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = session.role === 'admin' ? 'owner' : await getSceneRole(session.id, id)
  if (!canWrite(role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ ok: true })
}
