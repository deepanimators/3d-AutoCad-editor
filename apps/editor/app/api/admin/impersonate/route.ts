import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { getAdminAuth } from '@/lib/firebase/admin'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const schema = z.object({ userId: z.string().min(1) })

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'invalid_request' }, { status: 400 })

  const { userId } = parsed.data
  if (userId === session.id) {
    return NextResponse.json({ error: 'cannot_impersonate_self' }, { status: 400 })
  }

  const adminAuth = getAdminAuth()
  // Create a short-lived custom token the client can exchange for an ID token
  const customToken = await adminAuth.createCustomToken(userId, {
    impersonatedBy: session.id,
  })

  return NextResponse.json({ customToken })
}
