'use client'

import {
  type ConstructionDimensionNode,
  type MeasurementAnchor,
  useScene,
} from '@aruct/core'
import { useViewer } from '@aruct/viewer'
import { useMemo } from 'react'
import {
  formatLinearMeasurement,
  metersToLinearUnit,
} from '../../lib/measurements'
import { useFloorplanRender } from './floorplan-render-context'
import {
  computeArchitecturalDimensionLayout,
  FloorplanDimensionRenderer,
} from './renderers/floorplan-dimension-renderer'

// Resolve the 2D plan-space point (x, z) from a MeasurementAnchor.
// Feature anchors fall back to their recorded fallback point.
function anchorPoint(anchor: MeasurementAnchor): readonly [number, number] {
  if (Array.isArray(anchor)) {
    const [x, , z] = anchor as [number, number, number]
    return [x, z]
  }
  const { fallback } = anchor as { fallback: [number, number, number] }
  return [fallback[0], fallback[2]]
}

// Project a 3D anchor onto the dimension baseline in 2D (x/z plan).
// The baseline direction is a unit vector in plan space derived from the
// node's baseline.direction (x, z components).
function projectAnchorOntoBaseline(
  point: readonly [number, number],
  baselineOrigin: readonly [number, number],
  baselineDir: readonly [number, number],
  offsetNormal: readonly [number, number],
): { dimensionCoord: number; offset: number } {
  const dx = point[0] - baselineOrigin[0]
  const dz = point[1] - baselineOrigin[1]
  return {
    dimensionCoord: dx * baselineDir[0] + dz * baselineDir[1],
    offset: dx * offsetNormal[0] + dz * offsetNormal[1],
  }
}

// Build the FloorplanGeometry-compatible dimension descriptor from a node
// and the pair of anchor plan points (start, end). Returns null when the
// two points are coincident.
function buildDimensionGeometry(
  node: ConstructionDimensionNode,
  startPt: readonly [number, number],
  endPt: readonly [number, number],
  text: string,
  stroke: string,
) {
  // Dimension line direction
  const dx = endPt[0] - startPt[0]
  const dz = endPt[1] - startPt[1]
  const length = Math.hypot(dx, dz)
  if (length < 1e-6) return null

  // offsetNormal is the perpendicular that points from the anchor row toward
  // the dimension line (baseline). Derive it from the baseline direction.
  const [bx, bz] = node.baseline.direction
  const bLen = Math.hypot(bx, bz)
  const baselineDirX = bLen > 1e-9 ? bx / bLen : 1
  const baselineDirZ = bLen > 1e-9 ? bz / bLen : 0
  // offsetNormal is perpendicular to the baseline direction
  const offsetNormal: readonly [number, number] = [-baselineDirZ, baselineDirX]

  // Signed offset of start anchor from baseline origin along offsetNormal
  const originX = node.baseline.origin[0]
  const originZ = node.baseline.origin[1]
  const startProj = projectAnchorOntoBaseline(
    startPt,
    [originX, originZ],
    [baselineDirX, baselineDirZ],
    offsetNormal,
  )
  const offsetDistance = startProj.offset

  const style = node.style
  const extensionStartGap = style?.extensionLineGap ?? node.extensionStartGap
  const extensionOvershoot = style?.extensionLineOvershoot ?? node.extensionOvershoot
  const terminator =
    style?.arrowType === 'none'
      ? undefined
      : style?.arrowType ?? (node.terminator as 'architectural-tick' | 'filled-arrow' | 'open-arrow' | 'dot' | undefined)

  return {
    kind: 'dimension' as const,
    start: startPt as [number, number],
    end: endPt as [number, number],
    offsetNormal: offsetNormal as [number, number],
    offsetDistance,
    extensionStartGap,
    extensionOvershoot,
    terminator,
    textPosition: node.textPosition,
    text,
    stroke,
  }
}

function formatDimensionText(
  node: ConstructionDimensionNode,
  startPt: readonly [number, number],
  endPt: readonly [number, number],
  unit: string,
  metricNotation: 'meters' | 'millimeters',
): string {
  if (node.textOverride) return node.textOverride

  const dx = endPt[0] - startPt[0]
  const dz = endPt[1] - startPt[1]
  const distanceMeters = Math.hypot(dx, dz)

  const showUnits = node.style?.showUnits ?? true
  const prefix = node.style?.prefix ?? node.prefix
  const suffix = node.style?.suffix ?? node.suffix

  let label: string
  if (showUnits) {
    label = formatLinearMeasurement(distanceMeters, unit as Parameters<typeof formatLinearMeasurement>[1], metricNotation)
  } else {
    label = metersToLinearUnit(distanceMeters, unit as Parameters<typeof metersToLinearUnit>[1]).toFixed(3)
  }

  return `${prefix}${label}${suffix}`
}

function ConstructionDimensionSvg({
  node,
  unit,
  metricNotation,
  sceneRotationDeg,
}: {
  node: ConstructionDimensionNode
  unit: string
  metricNotation: 'meters' | 'millimeters'
  sceneRotationDeg: number
}) {
  // Only linear dimensions with exactly 2 anchors are visualised here.
  // Angular / arc-length modes require additional geometry resolution
  // that goes through the 3D measurement system.
  if (node.mode !== 'linear' || node.anchors.length < 2) return null

  const startAnchor = node.anchors[0]!
  const endAnchor = node.anchors[1]!
  const startPt = anchorPoint(startAnchor)
  const endPt = anchorPoint(endAnchor)

  const stroke = node.style?.lineColor ?? '#1a1a1a'
  const text = formatDimensionText(node, startPt, endPt, unit, metricNotation)
  const geometry = buildDimensionGeometry(node, startPt, endPt, text, stroke)
  if (!geometry) return null

  return (
    <FloorplanDimensionRenderer
      geometry={geometry}
      sceneRotationDeg={sceneRotationDeg}
      stroke={stroke}
    />
  )
}

export function FloorplanDimensionLayer() {
  const nodes = useScene((state) => state.nodes)
  const unit = useViewer((state) => state.unit)
  const metricNotation = useViewer((state) => state.metricNotation)
  const activeLevelId = useViewer((state) => state.selection.levelId)
  const renderContext = useFloorplanRender()
  const sceneRotationDeg = renderContext?.sceneRotationDeg ?? 0

  const dimensionNodes = useMemo(() => {
    return Object.values(nodes).filter(
      (node): node is ConstructionDimensionNode =>
        node !== undefined &&
        node.type === 'construction-dimension' &&
        node.visible !== false,
    )
  // activeLevelId retained for future parent-chain level filtering
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, activeLevelId])

  if (dimensionNodes.length === 0) return null

  return (
    <g data-floorplan-dimension-layer="" pointerEvents="none">
      {dimensionNodes.map((node) => (
        <ConstructionDimensionSvg
          key={node.id}
          metricNotation={metricNotation}
          node={node}
          sceneRotationDeg={sceneRotationDeg}
          unit={unit}
        />
      ))}
    </g>
  )
}

export default FloorplanDimensionLayer
