import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { type AnyNode } from '@aruct/core'
import { getSession } from '@/lib/auth-server'
import { canExportSchedules } from '@/lib/feature-gates'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

type SceneGraph = {
  nodes?: Record<string, AnyNode>
}

type DoorNode = Extract<AnyNode, { type: 'door' }>
type WindowNode = Extract<AnyNode, { type: 'window' }>
type ZoneNode = Extract<AnyNode, { type: 'zone' }>
type ItemNode = Extract<AnyNode, { type: 'item' }>

function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  const headerRow = header.map(csvEscape).join(',')
  const dataRows = rows.map((row) => row.map(csvEscape).join(','))
  return [headerRow, ...dataRows].join('\n')
}

function shortMark(id: string): string {
  return id.slice(-4).toUpperCase()
}

// Shoelace formula — polygon is array of [x, z] pairs
function polygonArea(polygon: [number, number][]): number {
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const [x1, z1] = polygon[i]!
    const [x2, z2] = polygon[(i + 1) % n]!
    area += x1 * z2 - x2 * z1
  }
  return Math.abs(area) / 2
}

function buildDoorSchedule(nodes: Record<string, AnyNode>): string {
  const header = ['Mark', 'Type', 'Width (m)', 'Height (m)', 'Category', 'Construction', 'Leaf Count']
  const rows: (string | number)[][] = []

  for (const node of Object.values(nodes)) {
    if (node.type !== 'door') continue
    const d = node as DoorNode
    rows.push([
      d.mark ?? shortMark(d.id),
      d.doorType ?? '',
      d.width,
      d.height,
      d.doorCategory ?? '',
      d.constructionType ?? '',
      d.leafCount ?? 1,
    ])
  }

  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return toCsv(header, rows)
}

function buildWindowSchedule(nodes: Record<string, AnyNode>): string {
  const header = ['Mark', 'Type', 'Width (m)', 'Height (m)', 'Construction']
  const rows: (string | number)[][] = []

  for (const node of Object.values(nodes)) {
    if (node.type !== 'window') continue
    const w = node as WindowNode
    rows.push([
      w.mark ?? shortMark(w.id),
      w.windowType ?? '',
      w.width,
      w.height,
      w.constructionType ?? '',
    ])
  }

  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return toCsv(header, rows)
}

function buildRoomSchedule(nodes: Record<string, AnyNode>): string {
  const header = ['Room Number', 'Name', 'Area (m²)', 'Ceiling Height (m)', 'Floor Finish', 'Wall Finish', 'Ceiling Finish', 'Occupancy']
  const rows: (string | number | null)[][] = []

  for (const node of Object.values(nodes)) {
    if (node.type !== 'zone') continue
    const z = node as ZoneNode
    if (z.spaceRole !== 'room') continue

    const area =
      z.polygon && z.polygon.length >= 3
        ? Number(polygonArea(z.polygon as [number, number][]).toFixed(2))
        : null

    rows.push([
      z.roomNumber ?? '',
      z.name ?? '',
      area,
      z.ceilingHeight ?? 2.7,
      z.floorFinish ?? '',
      z.wallFinish ?? '',
      z.ceilingFinish ?? '',
      z.occupancy ?? '',
    ])
  }

  rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return toCsv(header, rows)
}

function buildItemSchedule(nodes: Record<string, AnyNode>): string {
  const header = ['Mark', 'Name', 'Category', 'Width (m)', 'Height (m)', 'Depth (m)']
  const rows: (string | number)[][] = []

  for (const node of Object.values(nodes)) {
    if (node.type !== 'item') continue
    const it = node as ItemNode
    const [w, h, d] = it.asset.dimensions
    rows.push([
      shortMark(it.id),
      it.asset.name,
      it.asset.category,
      Number((w * it.scale[0]).toFixed(3)),
      Number((h * it.scale[1]).toFixed(3)),
      Number((d * it.scale[2]).toFixed(3)),
    ])
  }

  rows.sort((a, b) => String(a[1]).localeCompare(String(b[1])))
  return toCsv(header, rows)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  if (!canExportSchedules(session)) {
    return NextResponse.json(
      { error: 'forbidden', message: 'Schedule export requires a Pro plan.' },
      { status: 403 },
    )
  }

  let body: { sceneId?: string; scheduleType?: string }
  try {
    body = (await request.json()) as { sceneId?: string; scheduleType?: string }
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const { sceneId, scheduleType } = body

  if (!sceneId) {
    return NextResponse.json({ error: 'sceneId required' }, { status: 400 })
  }

  const validTypes = ['doors', 'windows', 'rooms', 'items'] as const
  type ScheduleType = (typeof validTypes)[number]

  if (!scheduleType || !validTypes.includes(scheduleType as ScheduleType)) {
    return NextResponse.json(
      { error: 'scheduleType must be one of: doors, windows, rooms, items' },
      { status: 400 },
    )
  }

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, sceneId))
  if (!scene) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  if (scene.ownerId !== session.id && session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  let graph: SceneGraph
  try {
    graph = JSON.parse(scene.graphJson) as SceneGraph
  } catch {
    return NextResponse.json({ error: 'invalid_scene_data' }, { status: 422 })
  }

  const nodes = graph.nodes ?? {}

  let csv: string
  let filename: string

  switch (scheduleType as ScheduleType) {
    case 'doors':
      csv = buildDoorSchedule(nodes)
      filename = 'door-schedule.csv'
      break
    case 'windows':
      csv = buildWindowSchedule(nodes)
      filename = 'window-schedule.csv'
      break
    case 'rooms':
      csv = buildRoomSchedule(nodes)
      filename = 'room-schedule.csv'
      break
    case 'items':
      csv = buildItemSchedule(nodes)
      filename = 'item-schedule.csv'
      break
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
