import type { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { canExportGLB } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canExportGLB(session)) {
    return new Response(JSON.stringify({ error: 'forbidden', message: 'GLB export requires a Pro plan.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return Response.json({ ok: true })
}
