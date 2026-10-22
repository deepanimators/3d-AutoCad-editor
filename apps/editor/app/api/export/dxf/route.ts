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
type ZoneLike = { type: 'zone'; polygon?: Vec2[]; name?: string; area?: number }
type DoorLike = { type: 'door'; position: Vec2; width: number; angle?: number }
type WindowLike = { type: 'window'; start: Vec2; end: Vec2; width?: number }
type StairLike = { type: 'stair'; polygon: Vec2[] }
type DimensionLike = {
  type: 'construction-dimension' | 'dimension'
  start: Vec2
  end: Vec2
  offset?: number
}
type AnyNodeLike =
  | WallLike
  | SlabLike
  | ZoneLike
  | DoorLike
  | WindowLike
  | StairLike
  | DimensionLike
  | { type: string }

// AIA standard layer definitions: [name, color-index]
// Color codes: 7=white, 1=red, 3=green, 4=cyan, 5=blue, 6=magenta, 2=yellow
const AIA_LAYERS: [string, number][] = [
  ['A-WALL',      7],
  ['A-DOOR',      1],
  ['A-GLAZ',      4],
  ['A-STRS',      6],
  ['A-FLOR-LEVL', 3],
  ['A-ANNO-DIMS', 2],
  ['A-ANNO-TEXT', 2],
  ['A-AREA',      5],
]

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
  const layerEntries = AIA_LAYERS.flatMap(([name, color]) => [
    '  0', 'LAYER',
    '  2', name,
    ' 70', '     0',
    ' 62', String(color).padStart(6),
    '  6', 'CONTINUOUS',
  ])

  return [
    '  0', 'SECTION',
    '  2', 'TABLES',
    '  0', 'TABLE',
    '  2', 'LAYER',
    ' 70', String(AIA_LAYERS.length).padStart(6),
    ...layerEntries,
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

// ARC entity (DXF R12): center, radius, start/end angle in degrees
function arcEntity(cx: number, cy: number, r: number, startDeg: number, endDeg: number, layer: string): string {
  return [
    '  0', 'ARC',
    '  8', layer,
    ' 10', fmt(cx),
    ' 20', fmt(cy),
    ' 30', '0.000000',
    ' 40', fmt(r),
    ' 50', fmt(startDeg),
    ' 51', fmt(endDeg),
  ].join('\n') + '\n'
}

// TEXT entity (DXF R12): insertion point, height, content
function textEntity(x: number, y: number, height: number, text: string, layer: string): string {
  return [
    '  0', 'TEXT',
    '  8', layer,
    ' 10', fmt(x),
    ' 20', fmt(y),
    ' 30', '0.000000',
    ' 40', fmt(height),
    '  1', text,
    ' 72', '     1', // horizontal centering
  ].join('\n') + '\n'
}

// DIMLINEAR entity (DXF R12): two definition points + text midpoint, dimension line offset
function dimlinearEntity(
  x1: number, y1: number,
  x2: number, y2: number,
  dimLineOffset: number,
  layer: string,
): string {
  // Dimension line position: midpoint between the two points, offset perpendicular
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 + dimLineOffset
  return [
    '  0', 'DIMENSION',
    '  8', layer,
    ' 10', fmt(mx),   // dimension line / text position X
    ' 20', fmt(my),   // dimension line / text position Y
    ' 30', '0.000000',
    ' 11', fmt(mx),   // text midpoint X
    ' 21', fmt(my),   // text midpoint Y
    ' 31', '0.000000',
    ' 70', '     1',  // dimension type: 1 = aligned / linear
    ' 13', fmt(x1),   // first extension line origin X
    ' 23', fmt(y1),
    ' 33', '0.000000',
    ' 14', fmt(x2),   // second extension line origin X
    ' 24', fmt(y2),
    ' 34', '0.000000',
  ].join('\n') + '\n'
}

// Compute polygon area via shoelace formula (returns m² when coords are in metres)
function polygonArea(pts: Vec2[]): number {
  let area = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const a = pts[i] as Vec2
    const b = pts[(i + 1) % n] as Vec2
    area += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(area) / 2
}

// Compute polygon centroid
function polygonCentroid(pts: Vec2[]): Vec2 {
  let cx = 0, cy = 0, area = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const a = pts[i] as Vec2
    const b = pts[(i + 1) % n] as Vec2
    const cross = a[0] * b[1] - b[0] * a[1]
    cx += (a[0] + b[0]) * cross
    cy += (a[1] + b[1]) * cross
    area += cross
  }
  area /= 2
  if (area === 0) {
    // Degenerate — return simple average
    const ax = pts.reduce((s, p) => s + p[0], 0) / n
    const ay = pts.reduce((s, p) => s + p[1], 0) / n
    return [ax, ay]
  }
  return [cx / (6 * area), cy / (6 * area)]
}

// Door symbol: door frame rectangle (thin rect at opening) + 90° swing arc
function doorEntities(door: DoorLike): string {
  const [px, py] = door.position
  const w = door.width
  const angle = door.angle ?? 0 // hinge wall direction in radians

  const cos = Math.cos(angle)
  const sin = Math.sin(angle)

  // Frame: thin rectangle along wall direction, width=w, depth=0.05m
  const depth = 0.05
  const frameCorners: Vec2[] = [
    [px,                     py                    ],
    [px + cos * w,           py + sin * w          ],
    [px + cos * w - sin * depth, py + sin * w + cos * depth],
    [px            - sin * depth, py            + cos * depth],
  ]

  // Swing arc: pivot at hinge end (position), radius=w, 0° to 90°
  // Convert angle from radians to degrees for DXF
  const hingeAngleDeg = (angle * 180) / Math.PI
  const swingStart = hingeAngleDeg
  const swingEnd   = hingeAngleDeg + 90

  return (
    lwpolylineEntity(frameCorners, 'A-DOOR', true) +
    arcEntity(px, py, w, swingStart, swingEnd, 'A-DOOR')
  )
}

// Window symbol: two parallel lines (glazing lines) across the wall opening
function windowEntities(win: WindowLike): string {
  const [x1, y1] = win.start
  const [x2, y2] = win.end
  const thickness = win.width ?? 0.1

  // Perpendicular unit vector
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return ''
  const nx = (-dy / len) * (thickness / 2)
  const ny = ( dx / len) * (thickness / 2)

  // Two parallel lines offset either side of centreline
  return (
    lineEntity(x1 + nx, y1 + ny, x2 + nx, y2 + ny, 'A-GLAZ') +
    lineEntity(x1 - nx, y1 - ny, x2 - nx, y2 - ny, 'A-GLAZ')
  )
}

function buildDxf(nodes: AnyNodeLike[]): string {
  const entitiesLines: string[] = []

  for (const node of nodes) {
    if (node.type === 'wall') {
      const w = node as WallLike
      entitiesLines.push(lineEntity(w.start[0], w.start[1], w.end[0], w.end[1], 'A-WALL'))
    } else if (node.type === 'slab') {
      const s = node as SlabLike
      if (s.polygon && s.polygon.length >= 3) {
        entitiesLines.push(lwpolylineEntity(s.polygon, 'A-FLOR-LEVL', true))
      }
    } else if (node.type === 'zone') {
      const z = node as ZoneLike
      if (z.polygon && z.polygon.length >= 3) {
        entitiesLines.push(lwpolylineEntity(z.polygon, 'A-AREA', true))
        // Room label: name + area at centroid
        const centroid = polygonCentroid(z.polygon)
        const area = z.area ?? polygonArea(z.polygon)
        const label = z.name
          ? `${z.name}  ${area.toFixed(2)} m\xb2`
          : `${area.toFixed(2)} m\xb2`
        entitiesLines.push(textEntity(centroid[0], centroid[1], 0.25, label, 'A-ANNO-TEXT'))
      }
    } else if (node.type === 'door') {
      entitiesLines.push(doorEntities(node as DoorLike))
    } else if (node.type === 'window') {
      entitiesLines.push(windowEntities(node as WindowLike))
    } else if (node.type === 'stair') {
      const s = node as StairLike
      if (s.polygon && s.polygon.length >= 3) {
        entitiesLines.push(lwpolylineEntity(s.polygon, 'A-STRS', true))
      }
    } else if (node.type === 'construction-dimension' || node.type === 'dimension') {
      const d = node as DimensionLike
      const offset = d.offset ?? 0.5
      entitiesLines.push(
        dimlinearEntity(d.start[0], d.start[1], d.end[0], d.end[1], offset, 'A-ANNO-DIMS'),
      )
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
