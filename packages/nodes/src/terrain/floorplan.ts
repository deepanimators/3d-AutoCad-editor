import type { FloorplanGeometry, FloorplanPoint, GeometryContext } from '@aruct/core'
import type { TerrainNode } from './schema'

/**
 * 2D floor-plan representation of the terrain: a simple rectangle
 * showing the terrain footprint (sizeX × sizeZ centred at the origin).
 * When selected, renders with an accent stroke and a cross-hatch fill.
 */
export function buildTerrainFloorplan(
  node: TerrainNode,
  ctx: GeometryContext,
): FloorplanGeometry | null {
  const halfX = node.sizeX / 2
  const halfZ = node.sizeZ / 2

  const outer: FloorplanPoint[] = [
    [-halfX, -halfZ],
    [halfX, -halfZ],
    [halfX, halfZ],
    [-halfX, halfZ],
  ]

  const view = ctx.viewState
  const palette = view?.palette
  const isSelected = view?.selected ?? false
  const isHighlighted = view?.highlighted ?? false
  const showSelectedChrome = isSelected || isHighlighted

  const ring = (points: FloorplanPoint[]) => {
    const [first, ...rest] = points
    if (!first) return ''
    return [`M ${first[0]} ${first[1]}`, ...rest.map(([x, y]) => `L ${x} ${y}`), 'Z'].join(' ')
  }

  const stroke = showSelectedChrome && palette ? palette.selectedStroke : '#4b7c59'
  const fill = showSelectedChrome ? '#d1fae5' : '#bbf7d0'

  const children: FloorplanGeometry[] = [
    {
      kind: 'path',
      d: ring(outer),
      fill,
      fillOpacity: showSelectedChrome ? 0.4 : 0.5,
      stroke,
      strokeWidth: showSelectedChrome ? 0.04 : 0.03,
      strokeOpacity: showSelectedChrome ? 0.96 : 0.8,
    },
  ]

  if (isSelected && palette) {
    children.push({
      kind: 'hatch',
      points: outer,
      color: palette.selectedHatch,
      opacity: 0.5,
    })
  }

  return { kind: 'group', children }
}
