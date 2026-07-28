import type { GeometryContext } from '@aruct/core'
import {
  BoxGeometry,
  Color,
  DoubleSide,
  FrontSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three'
import type { CurtainWallNode } from './schema'

/**
 * Builds curtain-wall geometry from a CurtainWallNode.
 *
 * Coordinate convention: the wall runs in the XZ plane (X = span, Y = height,
 * Z = depth). The geometry is positioned at the start point and rotated to face
 * the correct direction; the <GeometrySystem> mounts it under the node's
 * registered group which already carries the level elevation transform.
 *
 * Structure:
 *  - Vertical mullions at X = 0, mullionSpacingX, 2*mullionSpacingX … spanLength
 *  - Horizontal transoms at Y = 0, mullionSpacingY, 2*mullionSpacingY … height
 *  - Glazing (or spandrel/opaque) panels filling each grid cell
 *
 * The returned Group is in start-relative local space with the wall along +X.
 * Callers must translate/rotate to world position (handled by the registry via
 * the node's parent level transform + the group's own userData placement).
 */
export function buildCurtainWallGeometry(
  node: CurtainWallNode,
  _ctx: GeometryContext,
): Group {
  const group = new Group()

  const dx = node.end[0] - node.start[0]
  const dz = node.end[1] - node.start[1]
  const spanLength = Math.max(Math.hypot(dx, dz), 0.01)
  const angle = Math.atan2(dz, dx)

  const {
    height,
    mullionSpacingX,
    mullionSpacingY,
    mullionWidth,
    mullionDepth,
    frameColor,
    glazingColor,
    glazingOpacity,
    panelType,
  } = node

  const frameMat = new MeshStandardMaterial({
    color: new Color(frameColor),
    roughness: 0.4,
    metalness: 0.6,
    side: FrontSide,
  })

  const panelMat = new MeshStandardMaterial({
    color: new Color(glazingColor),
    roughness: panelType === 'glazing' ? 0.05 : 0.8,
    metalness: panelType === 'glazing' ? 0.1 : 0.0,
    transparent: panelType === 'glazing',
    opacity: panelType === 'glazing' ? glazingOpacity : 1.0,
    side: DoubleSide,
  })

  // Count grid cells
  const colCount = Math.max(Math.ceil(spanLength / mullionSpacingX), 1)
  const rowCount = Math.max(Math.ceil(height / mullionSpacingY), 1)

  // Actual spacing after distributing evenly
  const cellW = spanLength / colCount
  const cellH = height / rowCount

  // Vertical mullions (including start and end)
  const mullionGeom = new BoxGeometry(mullionWidth, height, mullionDepth)
  for (let c = 0; c <= colCount; c++) {
    const mesh = new Mesh(mullionGeom, frameMat)
    mesh.position.set(c * cellW, height / 2, 0)
    group.add(mesh)
  }

  // Horizontal transoms (excluding the very bottom and very top which are implicit)
  const transomGeom = new BoxGeometry(spanLength, mullionWidth, mullionDepth)
  for (let r = 0; r <= rowCount; r++) {
    const mesh = new Mesh(transomGeom, frameMat)
    mesh.position.set(spanLength / 2, r * cellH, 0)
    group.add(mesh)
  }

  // Glazing / fill panels in each grid cell
  const panelW = cellW - mullionWidth
  const panelH = cellH - mullionWidth
  if (panelW > 0.001 && panelH > 0.001) {
    const panelGeom = new PlaneGeometry(panelW, panelH)
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < colCount; c++) {
        const mesh = new Mesh(panelGeom, panelMat)
        mesh.position.set(
          c * cellW + cellW / 2,
          r * cellH + cellH / 2,
          0,
        )
        group.add(mesh)
      }
    }
  }

  // Translate so that start point is at world origin of the group,
  // then rotate around Y to face the correct direction.
  group.position.set(node.start[0], 0, node.start[1])
  group.rotation.y = -angle

  return group
}
