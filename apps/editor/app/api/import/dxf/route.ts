import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { canImportDwg } from '@/lib/feature-gates'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ALLOWED_EXTENSIONS = new Set(['.dxf'])

// DXF group code parsing — each pair of lines is (group code, value)
function parseDxfGroups(text: string): Array<[number, string]> {
  const lines = text.split(/\r?\n/)
  const groups: Array<[number, string]> = []
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = parseInt(lines[i]!.trim(), 10)
    const value = lines[i + 1]!.trim()
    if (!isNaN(code)) groups.push([code, value])
  }
  return groups
}

type DxfEntity = {
  type: string
  layer: string
  groups: Array<[number, string]>
}

function collectEntities(groups: Array<[number, string]>): DxfEntity[] {
  const entities: DxfEntity[] = []
  let inEntitiesSection = false
  let current: DxfEntity | null = null

  for (const [code, value] of groups) {
    if (code === 2 && value === 'ENTITIES') { inEntitiesSection = true; continue }
    if (code === 2 && value === 'ENDSEC' && inEntitiesSection) { inEntitiesSection = false; continue }
    if (!inEntitiesSection) continue

    if (code === 0) {
      if (current) entities.push(current)
      if (value === 'ENDSEC' || value === 'EOF') { current = null; continue }
      current = { type: value, layer: '0', groups: [] }
    } else if (current) {
      if (code === 8) current.layer = value
      current.groups.push([code, value])
    }
  }
  if (current) entities.push(current)
  return entities
}

function getNumericGroup(groups: Array<[number, string]>, code: number, fallback = 0): number {
  const found = groups.find(([c]) => c === code)
  return found ? (parseFloat(found[1]) || fallback) : fallback
}

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 18)}`
}

type ImportedNode =
  | { object: 'node'; id: string; type: 'wall'; parentId: null; visible: boolean; start: [number, number]; end: [number, number] }
  | { object: 'node'; id: string; type: 'slab'; parentId: null; visible: boolean; polygon: [number, number][]; elevation: number; thickness: number }

function dxfToNodes(text: string): {
  nodes: ImportedNode[]
  stats: { lines: number; polylines: number; inserts: number; skipped: number }
} {
  const groups = parseDxfGroups(text)
  const entities = collectEntities(groups)

  const nodes: ImportedNode[] = []
  const stats = { lines: 0, polylines: 0, inserts: 0, skipped: 0 }

  for (const entity of entities) {
    if (entity.type === 'LINE') {
      const x1 = getNumericGroup(entity.groups, 10)
      const y1 = getNumericGroup(entity.groups, 20)
      const x2 = getNumericGroup(entity.groups, 11)
      const y2 = getNumericGroup(entity.groups, 21)
      // Skip degenerate lines
      if (Math.abs(x2 - x1) < 1e-6 && Math.abs(y2 - y1) < 1e-6) { stats.skipped++; continue }
      nodes.push({
        object: 'node',
        id: makeId('wall'),
        type: 'wall',
        parentId: null,
        visible: true,
        start: [x1, y1],
        end: [x2, y2],
      })
      stats.lines++
    } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
      // Collect vertices from group 10/20 pairs
      const vertices: [number, number][] = []
      let pendingX: number | null = null
      for (const [code, value] of entity.groups) {
        if (code === 10) { pendingX = parseFloat(value); continue }
        if (code === 20 && pendingX !== null) {
          vertices.push([pendingX, parseFloat(value)])
          pendingX = null
        }
      }
      if (vertices.length < 2) { stats.skipped++; continue }
      // Closed polylines (70 flag bit 1) → slab; open → walls from each segment
      const flag = getNumericGroup(entity.groups, 70, 0)
      const isClosed = (flag & 1) === 1 || (
        vertices.length >= 3 &&
        Math.abs(vertices[0]![0] - vertices[vertices.length - 1]![0]) < 1e-6 &&
        Math.abs(vertices[0]![1] - vertices[vertices.length - 1]![1]) < 1e-6
      )
      if (isClosed && vertices.length >= 3) {
        // Deduplicate closing vertex if it duplicates the first
        const poly = (
          Math.abs(vertices[0]![0] - vertices[vertices.length - 1]![0]) < 1e-6 &&
          Math.abs(vertices[0]![1] - vertices[vertices.length - 1]![1]) < 1e-6
        ) ? vertices.slice(0, -1) : vertices
        nodes.push({
          object: 'node',
          id: makeId('slab'),
          type: 'slab',
          parentId: null,
          visible: true,
          polygon: poly,
          elevation: 0.05,
          thickness: 0.05,
        })
        stats.polylines++
      } else {
        // Open polyline → sequence of wall segments
        for (let i = 0; i + 1 < vertices.length; i++) {
          nodes.push({
            object: 'node',
            id: makeId('wall'),
            type: 'wall',
            parentId: null,
            visible: true,
            start: vertices[i]!,
            end: vertices[i + 1]!,
          })
        }
        stats.polylines++
      }
    } else if (entity.type === 'INSERT') {
      stats.inserts++
    } else {
      stats.skipped++
    }
  }

  return { nodes, stats }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canImportDwg(session)) {
    return NextResponse.json({ error: 'Pro plan required to import DXF files' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  const nameLower = file.name.toLowerCase()
  const ext = nameLower.slice(nameLower.lastIndexOf('.'))
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Only .dxf files are accepted. DWG binary import requires server-side conversion and is coming soon.' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 50 MB limit' }, { status: 413 })
  }

  const text = await file.text()
  const { nodes, stats } = dxfToNodes(text)

  return NextResponse.json({ nodes, stats })
}
