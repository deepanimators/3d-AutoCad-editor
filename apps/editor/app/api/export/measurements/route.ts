import { type NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import {
  measurementAnchorFallback,
  measurementAngle,
  measurementArea,
  measurementDistance,
  measurementPerimeter,
  measurementPrismVolume,
  type AnyNode,
  type MeasurementAnchor,
  type MeasurementNode,
} from '@aruct/core'
import { getSession } from '@/lib/auth-server'
import { db } from '@/lib/db/client'
import { scenes } from '@/lib/db/schema'

export const dynamic = 'force-dynamic'

function fallback(anchor: MeasurementAnchor): [number, number, number] {
  return measurementAnchorFallback(anchor)
}

function computeValue(node: MeasurementNode): { value: number; unit: string } {
  const m = node.measurement
  switch (m.kind) {
    case 'distance': {
      const [a, b] = m.points
      return { value: measurementDistance(fallback(a), fallback(b)), unit: 'm' }
    }
    case 'angle': {
      const [a, b, c] = m.points
      const radians = measurementAngle(fallback(a), fallback(b), fallback(c))
      return { value: (radians * 180) / Math.PI, unit: 'deg' }
    }
    case 'area': {
      return { value: measurementArea(m.base.map(fallback)), unit: 'm²' }
    }
    case 'perimeter': {
      return { value: measurementPerimeter(m.base.map(fallback)), unit: 'm' }
    }
    case 'volume': {
      return { value: measurementPrismVolume(m.base.map(fallback), fallback(m.extrusion)), unit: 'm³' }
    }
  }
}

function measurementsToCsv(nodes: MeasurementNode[]): string {
  const header = 'ID,Kind,Value,Unit'
  const rows = nodes.map((node) => {
    const { value, unit } = computeValue(node)
    return [node.id, node.measurement.kind, value.toFixed(4), unit]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  })
  return [header, ...rows].join('\n')
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sceneId = request.nextUrl.searchParams.get('sceneId')
  if (!sceneId) return NextResponse.json({ error: 'sceneId required' }, { status: 400 })

  const [scene] = await db.select().from(scenes).where(eq(scenes.id, sceneId))
  if (!scene) return NextResponse.json({ error: 'Scene not found' }, { status: 404 })

  let graph: { nodes?: Record<string, AnyNode> }
  try {
    graph = JSON.parse(scene.graphJson) as { nodes?: Record<string, AnyNode> }
  } catch {
    return NextResponse.json({ error: 'Invalid scene data' }, { status: 422 })
  }

  const measurementNodes = Object.values(graph.nodes ?? {}).filter(
    (n): n is MeasurementNode => n.type === 'measurement',
  )

  const csv = measurementsToCsv(measurementNodes)

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="measurements.csv"`,
    },
  })
}
