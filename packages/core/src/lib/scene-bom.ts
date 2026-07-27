import type {
  AnyNode,
  CeilingNode,
  DoorNode,
  FenceNode,
  ItemNode,
  RoofNode,
  SlabNode,
  StairSegmentNode,
  WallNode,
  WindowNode,
} from '../schema'

export type BomLineItem = {
  nodeType: string
  label: string
  count: number
  unit: 'ea' | 'm' | 'm²'
  quantity: number
  quantityUnit: string
}

export type BomReport = {
  items: BomLineItem[]
  totalNodes: number
  generatedAt: string
}

// Shoelace formula for polygon area
function polygonArea(polygon: readonly (readonly [number, number])[]): number {
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const a = polygon[i]!
    const b = polygon[(i + 1) % n]!
    area += a[0] * b[1] - b[0] * a[1]
  }
  return Math.abs(area) / 2
}

function dist2D(a: readonly [number, number], b: readonly [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1])
}

export function computeSceneBom(nodes: Record<string, AnyNode>): BomReport {
  const nodeList = Object.values(nodes)
  const totalNodes = nodeList.length

  // Accumulators keyed by type (or item:category for ItemNode)
  const wallCount: { count: number; length: number; area: number } = {
    count: 0,
    length: 0,
    area: 0,
  }
  const doorCount: { count: number; area: number } = { count: 0, area: 0 }
  const windowCount: { count: number; area: number } = { count: 0, area: 0 }
  const slabCount: { count: number; area: number } = { count: 0, area: 0 }
  const ceilingCount: { count: number; area: number } = { count: 0, area: 0 }
  let roofCount = 0
  let stairSegmentCount = 0
  const fenceCount: { count: number; length: number } = { count: 0, length: 0 }
  // ItemNode grouped by category
  const itemsByCategory = new Map<string, number>()
  // All other types
  const otherCounts = new Map<string, number>()

  for (const node of nodeList) {
    switch (node.type) {
      case 'wall': {
        const wall = node as WallNode
        const len = dist2D(wall.start, wall.end)
        const height = wall.height ?? 2.4 // fallback if no explicit height
        wallCount.count += 1
        wallCount.length += len
        wallCount.area += len * height
        break
      }
      case 'door': {
        const door = node as DoorNode
        doorCount.count += 1
        doorCount.area += door.width * door.height
        break
      }
      case 'window': {
        const win = node as WindowNode
        windowCount.count += 1
        windowCount.area += win.width * win.height
        break
      }
      case 'slab': {
        const slab = node as SlabNode
        slabCount.count += 1
        slabCount.area += polygonArea(slab.polygon)
        break
      }
      case 'ceiling': {
        const ceiling = node as CeilingNode
        ceilingCount.count += 1
        ceilingCount.area += polygonArea(ceiling.polygon)
        break
      }
      case 'roof': {
        // RoofNode is a container; count the container only
        roofCount += 1
        break
      }
      case 'stair-segment': {
        stairSegmentCount += 1
        break
      }
      case 'fence': {
        const fence = node as FenceNode
        fenceCount.count += 1
        fenceCount.length += dist2D(fence.start, fence.end)
        break
      }
      case 'item': {
        const item = node as ItemNode
        const category = item.asset?.category ?? 'uncategorized'
        itemsByCategory.set(category, (itemsByCategory.get(category) ?? 0) + 1)
        break
      }
      default: {
        const t = node.type as string
        // Skip purely structural/non-countable types unlikely to appear in BOM
        const skip = new Set([
          'level',
          'building',
          'site',
          'zone',
          'guide',
          'spawn',
          'camera',
          'scan',
          'measurement',
          'drawing-sheet',
          'structural-grid',
          'construction-dimension',
        ])
        if (!skip.has(t)) {
          otherCounts.set(t, (otherCounts.get(t) ?? 0) + 1)
        }
        break
      }
    }
  }

  const items: BomLineItem[] = []

  // Structural
  if (wallCount.count > 0) {
    items.push({
      nodeType: 'wall',
      label: 'Walls',
      count: wallCount.count,
      unit: 'm',
      quantity: Math.round(wallCount.length * 100) / 100,
      quantityUnit: 'm (linear)',
    })
    items.push({
      nodeType: 'wall',
      label: 'Wall Surface (gross)',
      count: wallCount.count,
      unit: 'm²',
      quantity: Math.round(wallCount.area * 100) / 100,
      quantityUnit: 'm²',
    })
  }

  if (slabCount.count > 0) {
    items.push({
      nodeType: 'slab',
      label: 'Slabs / Floors',
      count: slabCount.count,
      unit: 'm²',
      quantity: Math.round(slabCount.area * 100) / 100,
      quantityUnit: 'm²',
    })
  }

  if (ceilingCount.count > 0) {
    items.push({
      nodeType: 'ceiling',
      label: 'Ceilings',
      count: ceilingCount.count,
      unit: 'm²',
      quantity: Math.round(ceilingCount.area * 100) / 100,
      quantityUnit: 'm²',
    })
  }

  if (roofCount > 0) {
    items.push({
      nodeType: 'roof',
      label: 'Roofs',
      count: roofCount,
      unit: 'ea',
      quantity: roofCount,
      quantityUnit: 'ea',
    })
  }

  if (stairSegmentCount > 0) {
    items.push({
      nodeType: 'stair-segment',
      label: 'Stair Segments',
      count: stairSegmentCount,
      unit: 'ea',
      quantity: stairSegmentCount,
      quantityUnit: 'ea',
    })
  }

  if (fenceCount.count > 0) {
    items.push({
      nodeType: 'fence',
      label: 'Fences',
      count: fenceCount.count,
      unit: 'm',
      quantity: Math.round(fenceCount.length * 100) / 100,
      quantityUnit: 'm (linear)',
    })
  }

  // Openings
  if (doorCount.count > 0) {
    items.push({
      nodeType: 'door',
      label: 'Doors',
      count: doorCount.count,
      unit: 'm²',
      quantity: Math.round(doorCount.area * 100) / 100,
      quantityUnit: 'm² (opening)',
    })
  }

  if (windowCount.count > 0) {
    items.push({
      nodeType: 'window',
      label: 'Windows',
      count: windowCount.count,
      unit: 'm²',
      quantity: Math.round(windowCount.area * 100) / 100,
      quantityUnit: 'm² (opening)',
    })
  }

  // Furniture / Items by category
  for (const [category, count] of itemsByCategory.entries()) {
    items.push({
      nodeType: 'item',
      label: `Items — ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      count,
      unit: 'ea',
      quantity: count,
      quantityUnit: 'ea',
    })
  }

  // Other node types
  for (const [type, count] of otherCounts.entries()) {
    items.push({
      nodeType: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
      count,
      unit: 'ea',
      quantity: count,
      quantityUnit: 'ea',
    })
  }

  return {
    items,
    totalNodes,
    generatedAt: new Date().toISOString(),
  }
}
