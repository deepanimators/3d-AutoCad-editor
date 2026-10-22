import {
  type AnyNodeId,
  type CurtainWallNode,
  sceneRegistry,
  useScene,
} from '@aruct/core'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Throttle: process at most this many curtain-wall nodes per frame.
const MAX_CURTAIN_WALLS_PER_FRAME = 3

// Shared reusable materials — created once and reused across all instances.
// Disposed only when the application unmounts (not managed here).
const mullionMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#6b7280'),
  metalness: 0.8,
  roughness: 0.2,
})

const glazingMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color('#a8c4d4'),
  transparent: true,
  opacity: 0.3,
  roughness: 0,
  transmission: 0.9,
  side: THREE.DoubleSide,
})

const spandrelMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#4b5563'),
  metalness: 0.3,
  roughness: 0.6,
})

const opaqueMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color('#9ca3af'),
  metalness: 0.1,
  roughness: 0.7,
})

// ============================================================================
// GEOMETRY GENERATION
// ============================================================================

/**
 * Builds merged frame (mullion + transom) geometry for a curtain wall.
 *
 * The wall runs along the XZ plane from `start` to `end` in level space.
 * Vertical mullions are spaced at `mullionSpacingX`, horizontal transoms at
 * `mullionSpacingY`. All members share `mullionWidth × mullionDepth` cross
 * sections and are built as axis-aligned boxes in world space, then merged
 * into a single BufferGeometry for efficient rendering.
 */
function buildFrameGeometry(node: CurtainWallNode): THREE.BufferGeometry {
  const [sx, sy] = node.start
  const [ex, ey] = node.end
  const wallLength = Math.hypot(ex - sx, ey - sy)

  if (wallLength < 1e-6 || node.height < 1e-6) {
    return new THREE.BufferGeometry()
  }

  const angle = Math.atan2(ey - sy, ex - sx)
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  const mw = node.mullionWidth   // cross-section width (along wall face)
  const md = node.mullionDepth   // cross-section depth (through wall)
  const height = node.height

  const spacingX = node.mullionSpacingX
  const spacingY = node.mullionSpacingY

  // Column positions along wall length (including end posts at 0 and wallLength)
  const colCount = Math.max(2, Math.floor(wallLength / spacingX) + 1)
  const colPositions: number[] = []
  for (let c = 0; c < colCount; c++) {
    colPositions.push((c / (colCount - 1)) * wallLength)
  }

  // Row positions along wall height (including top and bottom rails at 0 and height)
  const rowCount = Math.max(2, Math.floor(height / spacingY) + 1)
  const rowPositions: number[] = []
  for (let r = 0; r < rowCount; r++) {
    rowPositions.push((r / (rowCount - 1)) * height)
  }

  const parts: THREE.BufferGeometry[] = []

  // Vertical mullions — one per column position, running full height
  for (const localX of colPositions) {
    const worldX = sx + cosA * localX
    const worldZ = sy + sinA * localX

    const geo = new THREE.BoxGeometry(mw, height, md)
    geo.rotateY(-angle)
    geo.translate(worldX, height / 2, worldZ)
    parts.push(geo)
  }

  // Horizontal transoms — one per row position, running full wall length
  for (const localY of rowPositions) {
    // Transom spans from start to end; center in XZ is the wall midpoint
    const midX = (sx + ex) / 2
    const midZ = (sy + ey) / 2

    // Along-wall extent: wallLength × mw, depth: md, height: mw
    const geo = new THREE.BoxGeometry(wallLength, mw, md)
    geo.rotateY(-angle)
    geo.translate(midX, localY, midZ)
    parts.push(geo)
  }

  if (parts.length === 0) return new THREE.BufferGeometry()

  const merged = mergeGeometries(parts, false) ?? new THREE.BufferGeometry()
  for (const geo of parts) geo.dispose()
  merged.computeVertexNormals()
  return merged
}

/**
 * Builds merged panel geometry — one thin plane per grid cell between mullions
 * and transoms. For `glazing` panels, uses a 8 mm thick box (or a plane for
 * performance); for `spandrel`/`opaque`, uses the same geometry but a
 * different material is applied by the caller.
 *
 * Returns geometry placed in world space at the wall position.
 */
function buildPanelGeometry(node: CurtainWallNode): THREE.BufferGeometry {
  const [sx, sy] = node.start
  const [ex, ey] = node.end
  const wallLength = Math.hypot(ex - sx, ey - sy)

  if (wallLength < 1e-6 || node.height < 1e-6) {
    return new THREE.BufferGeometry()
  }

  const angle = Math.atan2(ey - sy, ex - sx)
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)

  const mw = node.mullionWidth
  const height = node.height
  const PANEL_THICKNESS = 0.008 // 8 mm

  const spacingX = node.mullionSpacingX
  const spacingY = node.mullionSpacingY

  const colCount = Math.max(2, Math.floor(wallLength / spacingX) + 1)
  const rowCount = Math.max(2, Math.floor(height / spacingY) + 1)

  // Actual cell sizes — evenly distributed between the edge mullions
  const panelWidth = wallLength / (colCount - 1) - mw
  const panelHeight = height / (rowCount - 1) - mw

  if (panelWidth <= 0 || panelHeight <= 0) return new THREE.BufferGeometry()

  const parts: THREE.BufferGeometry[] = []

  for (let c = 0; c < colCount - 1; c++) {
    // Center of panel cell in local X (along wall)
    const localXCenter = ((c + 0.5) / (colCount - 1)) * wallLength

    for (let r = 0; r < rowCount - 1; r++) {
      const localYCenter = ((r + 0.5) / (rowCount - 1)) * height

      const worldX = sx + cosA * localXCenter
      const worldZ = sy + sinA * localXCenter

      const geo = new THREE.BoxGeometry(panelWidth, panelHeight, PANEL_THICKNESS)
      geo.rotateY(-angle)
      geo.translate(worldX, localYCenter, worldZ)
      parts.push(geo)
    }
  }

  if (parts.length === 0) return new THREE.BufferGeometry()

  const merged = mergeGeometries(parts, false) ?? new THREE.BufferGeometry()
  for (const geo of parts) geo.dispose()
  merged.computeVertexNormals()
  return merged
}

/**
 * Selects the Three.js material for panel fill based on `panelType`.
 * For glazing, the base color/opacity from the node override the shared
 * material (a clone is used to avoid mutating the shared instance when
 * per-instance colors differ).
 */
function getPanelMaterial(node: CurtainWallNode): THREE.Material {
  if (node.panelType === 'spandrel') return spandrelMaterial
  if (node.panelType === 'opaque') return opaqueMaterial

  // glazing — check if the node's values differ from the shared defaults;
  // if so, return a per-instance clone so we don't pollute other walls.
  const defaultColor = '#a8c4d4'
  const defaultOpacity = 0.3
  if (node.glazingColor === '#88aabb' && node.glazingOpacity === defaultOpacity) {
    // Node uses schema defaults — use the shared material (with our colour).
    return glazingMaterial
  }

  const mat = glazingMaterial.clone() as THREE.MeshPhysicalMaterial
  mat.color.set(node.glazingColor)
  mat.opacity = node.glazingOpacity
  return mat
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Rebuilds the frame and panel meshes inside the curtain wall group.
 * The group must already be registered in `sceneRegistry.nodes` (mounted
 * by the JSX renderer before the system runs).
 */
function updateCurtainWallGeometry(nodeId: CurtainWallNode['id']): void {
  const node = useScene.getState().nodes[nodeId]
  if (node?.type !== 'curtain-wall') return

  const group = sceneRegistry.nodes.get(nodeId) as THREE.Group | undefined
  if (!group) return

  const curtainWall = node as CurtainWallNode

  // ── Frame mesh ──────────────────────────────────────────────────────────
  let frameMesh = group.getObjectByName('cw-frame') as THREE.Mesh | undefined
  if (!frameMesh) {
    frameMesh = new THREE.Mesh(new THREE.BufferGeometry(), mullionMaterial)
    frameMesh.name = 'cw-frame'
    frameMesh.castShadow = true
    frameMesh.receiveShadow = true
    group.add(frameMesh)
  }

  const frameGeo = buildFrameGeometry(curtainWall)
  frameMesh.geometry.dispose()
  frameMesh.geometry = frameGeo

  // Apply per-node frame colour only when it differs from the default
  if (curtainWall.frameColor !== '#c0c0c0') {
    if (frameMesh.material === mullionMaterial) {
      frameMesh.material = mullionMaterial.clone()
    }
    ;(frameMesh.material as THREE.MeshStandardMaterial).color.set(curtainWall.frameColor)
  } else if (frameMesh.material !== mullionMaterial) {
    // Revert to shared material if a clone was set before but colour reverted
    ;(frameMesh.material as THREE.Material).dispose()
    frameMesh.material = mullionMaterial
  }

  // ── Panel mesh ──────────────────────────────────────────────────────────
  let panelMesh = group.getObjectByName('cw-panels') as THREE.Mesh | undefined
  if (!panelMesh) {
    panelMesh = new THREE.Mesh(new THREE.BufferGeometry(), glazingMaterial)
    panelMesh.name = 'cw-panels'
    panelMesh.castShadow = false
    panelMesh.receiveShadow = true
    group.add(panelMesh)
  }

  const panelGeo = buildPanelGeometry(curtainWall)
  panelMesh.geometry.dispose()
  panelMesh.geometry = panelGeo

  const panelMat = getPanelMaterial(curtainWall)
  if (panelMesh.material !== panelMat) {
    // Dispose clones we created, but never dispose the shared instances.
    if (
      panelMesh.material !== glazingMaterial &&
      panelMesh.material !== spandrelMaterial &&
      panelMesh.material !== opaqueMaterial
    ) {
      ;(panelMesh.material as THREE.Material).dispose()
    }
    panelMesh.material = panelMat
  }

  // The group itself lives at the world origin — curtain-wall coordinates are
  // already in level world space (same convention as FenceNode).
  group.position.set(0, 0, 0)
  group.rotation.set(0, 0, 0)
}

// ============================================================================
// SYSTEM COMPONENT
// ============================================================================

/**
 * CurtainWallSystem — processes dirty curtain-wall nodes each frame and
 * rebuilds their 3D frame + panel geometry imperatively via sceneRegistry.
 *
 * Priority 4 matches WallSystem and FenceSystem, which also rebuild geometry
 * driven by dirty-node marks. Throttled to MAX_CURTAIN_WALLS_PER_FRAME to
 * keep frame budgets stable during large scene loads.
 */
export const CurtainWallSystem = () => {
  const dirtyNodes = useScene((state) => state.dirtyNodes)
  const clearDirty = useScene((state) => state.clearDirty)

  useFrame(() => {
    if (dirtyNodes.size === 0) return

    const nodes = useScene.getState().nodes
    let processed = 0

    dirtyNodes.forEach((id) => {
      if (processed >= MAX_CURTAIN_WALLS_PER_FRAME) return

      const node = nodes[id]
      if (node?.type !== 'curtain-wall') return

      updateCurtainWallGeometry(id as CurtainWallNode['id'])
      clearDirty(id as AnyNodeId)
      processed++
    })
  }, 4)

  return null
}
