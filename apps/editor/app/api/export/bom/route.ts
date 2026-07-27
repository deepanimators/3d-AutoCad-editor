import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { computeSceneBom, type AnyNode, type BomLineItem } from '@aruct/core'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

type SceneGraph = {
  nodes?: Record<string, AnyNode>
}

function bomToCsv(items: BomLineItem[]): string {
  const header = 'Type,Label,Count,Quantity,Unit'
  const rows = items.map((item) =>
    [item.nodeType, item.label, item.count, item.quantity, item.quantityUnit]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header, ...rows].join('\n')
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const sceneId = searchParams.get('sceneId')

  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId required' }, { status: 400 })
  }

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, sceneId))
  if (!scene) {
    return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
  }

  let graph: SceneGraph
  try {
    graph = JSON.parse(scene.graphJson) as SceneGraph
  } catch {
    return NextResponse.json({ error: 'Invalid scene data' }, { status: 422 })
  }

  const nodes = graph.nodes ?? {}
  const report = computeSceneBom(nodes)
  const csv = bomToCsv(report.items)

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="bom.csv"`,
    },
  })
}
