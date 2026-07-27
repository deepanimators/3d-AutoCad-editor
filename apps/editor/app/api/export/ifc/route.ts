import type { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const sceneId = url.searchParams.get('sceneId')
  if (!sceneId) {
    return new Response(JSON.stringify({ error: 'sceneId query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const [row] = await db
    .select({ graphJson: scenes.graphJson, name: scenes.name, ownerId: scenes.ownerId })
    .from(scenes)
    .where(eq(scenes.id, sceneId))

  if (!row) {
    return new Response(JSON.stringify({ error: 'not_found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Only the owner (or admins) may export for now
  if (row.ownerId !== session.id && session.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let sceneGraph: unknown
  try {
    sceneGraph = JSON.parse(row.graphJson)
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_scene_data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Dynamically import to avoid bundling web-ifc into edge runtime
  const { exportSceneToIfc } = await import('@aruct/ifc-converter')
  const ifcBytes = exportSceneToIfc(sceneGraph as Parameters<typeof exportSceneToIfc>[0], {
    projectName: row.name,
  })

  const safeName = row.name.replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'scene'

  return new Response(ifcBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeName}.ifc"`,
      'Content-Length': String(ifcBytes.byteLength),
    },
  })
}
