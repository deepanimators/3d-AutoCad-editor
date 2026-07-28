import type { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'
import { getSession } from '@/lib/auth-server'
import { canExportDxf } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

type Vec2 = [number, number]

type WallLike = { type: 'wall'; start: Vec2; end: Vec2 }
type SlabLike = { type: 'slab'; polygon: Vec2[] }
type ZoneLike = { type: 'zone'; polygon?: Vec2[] }
type AnyNodeLike = WallLike | SlabLike | ZoneLike | { type: string }

// DXF R12 generation — plain string concatenation, no library needed

function dxfHeader(): string {
  return [
    '  0', 'SECTION',
    '  2', 'HEADER',
    '  9', '$ACADVER',
    '  1', 'AC1009',
    '  0', 'ENDSEC',
  ].join('\n') + '\n'
}

function dxfTablesSection(): string {
  return [
    '  0', 'SECTION',
    '  2', 'TABLES',
    '  0', 'TABLE',
    '  2', 'LAYER',
    ' 70', '     3',
    '  0', 'LAYER',
    '  2', 'WALLS',
    ' 70', '     0',
    ' 62', '     7',
    '  6', 'CONTINUOUS',
    '  0', 'LAYER',
    '  2', 'SLABS',
    ' 70', '     0',
    ' 62', '     3',
    '  6', 'CONTINUOUS',
    '  0', 'LAYER',
    '  2', 'ZONES',
    ' 70', '     0',
    ' 62', '     5',
    '  6', 'CONTINUOUS',
    '  0', 'ENDTAB',
    '  0', 'ENDSEC',
  ].join('\n') + '\n'
}

function fmt(n: number): string {
  return n.toFixed(6)
}

function lineEntity(x1: number, y1: number, x2: number, y2: number, layer: string): string {
  return [
    '  0', 'LINE',
    '  8', layer,
    ' 10', fmt(x1),
    ' 20', fmt(y1),
    ' 30', '0.000000',
    ' 11', fmt(x2),
    ' 21', fmt(y2),
    ' 31', '0.000000',
  ].join('\n') + '\n'
}

function lwpolylineEntity(pts: Vec2[], layer: string, closed = false): string {
  const flag = closed ? 1 : 0
  const header = [
    '  0', 'LWPOLYLINE',
    '  8', layer,
    ' 90', String(pts.length),
    ' 70', String(flag),
  ]
  const vertices = pts.flatMap(([x, y]) => [' 10', fmt(x), ' 20', fmt(y)])
  return [...header, ...vertices].join('\n') + '\n'
}

function buildDxf(nodes: AnyNodeLike[]): string {
  const entitiesLines: string[] = []

  for (const node of nodes) {
    if (node.type === 'wall') {
      const w = node as WallLike
      entitiesLines.push(lineEntity(w.start[0], w.start[1], w.end[0], w.end[1], 'WALLS'))
    } else if (node.type === 'slab') {
      const s = node as SlabLike
      if (s.polygon && s.polygon.length >= 3) {
        entitiesLines.push(lwpolylineEntity(s.polygon, 'SLABS', true))
      }
    } else if (node.type === 'zone') {
      const z = node as ZoneLike
      if (z.polygon && z.polygon.length >= 3) {
        entitiesLines.push(lwpolylineEntity(z.polygon, 'ZONES', true))
      }
    }
  }

  const entitiesSection = [
    '  0', 'SECTION',
    '  2', 'ENTITIES',
  ].join('\n') + '\n' + entitiesLines.join('') + '  0\nENDSEC\n'

  return dxfHeader() + dxfTablesSection() + entitiesSection + '  0\nEOF\n'
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!canExportDxf(session)) {
    return new Response(
      JSON.stringify({ error: 'forbidden', message: 'DXF export requires a Pro plan.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    )
  }

  let sceneId: string | undefined
  try {
    const body = (await request.json()) as { sceneId?: string }
    sceneId = body.sceneId
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!sceneId) {
    return new Response(JSON.stringify({ error: 'sceneId is required' }), {
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

  if (row.ownerId !== session.id && session.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let graph: { nodes?: Record<string, AnyNodeLike> }
  try {
    graph = JSON.parse(row.graphJson) as { nodes?: Record<string, AnyNodeLike> }
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_scene_data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const nodeList: AnyNodeLike[] = graph.nodes ? Object.values(graph.nodes) : []
  const dxfText = buildDxf(nodeList)
  const safeName = (row.name ?? 'scene').replace(/[^a-zA-Z0-9_\- ]/g, '').trim() || 'scene'

  return new Response(dxfText, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="${safeName}.dxf"`,
    },
  })
}
