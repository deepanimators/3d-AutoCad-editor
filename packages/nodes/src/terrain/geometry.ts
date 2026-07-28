import type { GeometryContext, TerrainNode } from '@aruct/core'
import {
  type ColorPreset,
  createSurfaceRoleMaterial,
  type RenderShading,
} from '@aruct/viewer'
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  Group,
  LineSegments,
  Mesh,
  MeshLambertMaterial,
  PlaneGeometry,
} from 'three'

/**
 * Builds a PlaneGeometry displaced by the node's height map.
 * Returns a Group containing the terrain mesh and, when showContours
 * is true, a LineSegments overlay for horizontal contour lines.
 *
 * The plane is in the XZ plane (Y up), centred at the node's parent
 * origin. Heights index row-major: heights[row * gridCols + col].
 */
export function buildTerrainGeometry(
  node: TerrainNode,
  _ctx?: GeometryContext,
  shading: RenderShading = 'rendered',
  _textures = true,
  colorPreset: ColorPreset = 'clay',
  sceneTheme?: string,
): Group {
  const group = new Group()

  const { gridCols, gridRows, sizeX, sizeZ, heights, showContours, contourInterval } = node

  // PlaneGeometry is XY by default; we rotate -90° around X to put it in XZ.
  const geo = new PlaneGeometry(sizeX, sizeZ, gridCols - 1, gridRows - 1)
  geo.rotateX(-Math.PI / 2)

  const positions = geo.attributes.position as BufferAttribute
  const hasHeights = heights.length === gridCols * gridRows

  if (hasHeights) {
    for (let i = 0; i < positions.count; i++) {
      positions.setY(i, heights[i] ?? 0)
    }
    positions.needsUpdate = true
    geo.computeVertexNormals()
  }

  const material = createSurfaceRoleMaterial('floor', colorPreset, FrontSide, sceneTheme)
  const mesh = new Mesh(geo, material)
  mesh.receiveShadow = true
  mesh.castShadow = false
  group.add(mesh)

  if (showContours && hasHeights && contourInterval > 0) {
    const contourGeo = buildContourGeometry(positions, gridCols, gridRows, contourInterval)
    const contourMat = new MeshLambertMaterial({
      color: '#6b7280',
      side: DoubleSide,
    })
    const lines = new LineSegments(contourGeo, contourMat)
    // Lift slightly to prevent z-fighting with the terrain surface.
    lines.position.y = 0.01
    group.add(lines)
  }

  return group
}

/**
 * Scans each quad of the grid and emits line segments where the terrain
 * surface crosses a contour level. Uses linear interpolation along edges.
 */
function buildContourGeometry(
  positions: BufferAttribute,
  cols: number,
  rows: number,
  interval: number,
): BufferGeometry {
  const verts: number[] = []

  const getY = (col: number, row: number) => positions.getY(row * cols + col)
  const getX = (col: number) => positions.getX(col) // x is uniform per col
  const getZ = (row: number) => positions.getZ(row * cols) // z is uniform per row

  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const y00 = getY(c, r)
      const y10 = getY(c + 1, r)
      const y01 = getY(c, r + 1)
      const y11 = getY(c + 1, r + 1)

      const minY = Math.min(y00, y10, y01, y11)
      const maxY = Math.max(y00, y10, y01, y11)

      const firstLevel = Math.ceil(minY / interval) * interval
      for (let level = firstLevel; level <= maxY; level += interval) {
        // Walk the four edges of the quad and collect crossing points.
        const crossings: [number, number, number][] = []

        const edgeCheck = (
          ax: number,
          ay: number,
          az: number,
          bx: number,
          by: number,
          bz: number,
        ) => {
          if ((ay <= level && by > level) || (by <= level && ay > level)) {
            const t = (level - ay) / (by - ay)
            crossings.push([ax + t * (bx - ax), level, az + t * (bz - az)])
          }
        }

        const x0 = getX(c)
        const x1 = getX(c + 1)
        const z0 = getZ(r)
        const z1 = getZ(r + 1)

        edgeCheck(x0, y00, z0, x1, y10, z0) // bottom edge
        edgeCheck(x1, y10, z0, x1, y11, z1) // right edge
        edgeCheck(x0, y01, z1, x1, y11, z1) // top edge
        edgeCheck(x0, y00, z0, x0, y01, z1) // left edge

        // Emit a segment for each pair of crossings (should be 0 or 2).
        if (crossings.length >= 2) {
          const [a, b] = crossings
          if (a && b) {
            verts.push(a[0], a[1], a[2], b[0], b[1], b[2])
          }
        }
      }
    }
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(new Float32Array(verts), 3))
  return geo
}
