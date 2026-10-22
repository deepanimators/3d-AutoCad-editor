import {
  type AnyNodeId,
  type DuctFittingNode,
  type DuctSegmentNode,
  type DuctTerminalNode,
  getEffectiveNode,
  sceneRegistry,
  useScene,
} from '@aruct/core'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ============================================================================
// CONSTANTS
// ============================================================================

const INCHES_TO_METERS = 0.0254
const MAX_DUCT_UPDATES_PER_FRAME = 3

// Galvanized sheet-metal appearance.
const DUCT_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xc8cdd0,
  metalness: 0.4,
  roughness: 0.5,
})

// Semi-transparent insulation wrap.
const INSULATION_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xf5e6c8,
  metalness: 0.0,
  roughness: 0.9,
  transparent: true,
  opacity: 0.35,
  side: THREE.FrontSide,
})

// Shared quaternion helpers — allocated once to avoid per-frame GC pressure.
const _dir = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _quat = new THREE.Quaternion()
const _midpoint = new THREE.Vector3()

// ============================================================================
// GEOMETRY HELPERS
// ============================================================================

/**
 * Build a mesh (and optional insulation shell) representing one straight
 * segment between two consecutive path points.
 */
function buildSegmentMesh(
  start: THREE.Vector3,
  end: THREE.Vector3,
  node: DuctSegmentNode,
): THREE.Group {
  const group = new THREE.Group()

  _dir.subVectors(end, start)
  const length = _dir.length()
  if (length < 1e-5) return group

  _dir.normalize()
  _midpoint.addVectors(start, end).multiplyScalar(0.5)
  _quat.setFromUnitVectors(_up, _dir)

  const ductGeo = buildDuctCrossSection(node, length)
  const ductMesh = new THREE.Mesh(ductGeo, DUCT_MATERIAL)
  ductMesh.position.copy(_midpoint)
  ductMesh.quaternion.copy(_quat)
  ductMesh.castShadow = true
  group.add(ductMesh)

  if (node.insulated) {
    const insulGeo = buildInsulationShell(node, length)
    const insulMesh = new THREE.Mesh(insulGeo, INSULATION_MATERIAL)
    insulMesh.position.copy(_midpoint)
    insulMesh.quaternion.copy(_quat)
    group.add(insulMesh)
  }

  return group
}

/**
 * Returns a cylinder or box geometry oriented along the local Y axis (length
 * direction), centered at the origin.  The caller rotates it into world space.
 */
function buildDuctCrossSection(node: DuctSegmentNode, length: number): THREE.BufferGeometry {
  if (node.shape === 'round') {
    const radius = (node.diameter * INCHES_TO_METERS) / 2
    // 16 radial segments — light enough for dense MEP scenes.
    return new THREE.CylinderGeometry(radius, radius, length, 16, 1, false)
  }

  // rect and oval both render as a box; oval is an approximation (full
  // oval geometry is deferred to a future slice with custom profile extrusion).
  const w = node.width * INCHES_TO_METERS
  const h = node.height * INCHES_TO_METERS
  // BoxGeometry: width=X, height=Y (length axis), depth=Z.
  return new THREE.BoxGeometry(w, length, h)
}

/**
 * Insulation shell: slightly larger cross-section than the duct body.
 * R-value drives thickness linearly: ΔR=1 ≈ 12.7 mm (half-inch) of fibre.
 */
function buildInsulationShell(node: DuctSegmentNode, length: number): THREE.BufferGeometry {
  const thicknessM = node.insulationR * 0.0127 + 0.013 // at least 13 mm
  const padding = thicknessM * 2

  if (node.shape === 'round') {
    const innerRadius = (node.diameter * INCHES_TO_METERS) / 2
    const outerRadius = innerRadius + thicknessM
    // Thin cylindrical shell: inner radius ≈ outerRadius so we use a single
    // cylinder slightly oversized and rely on opacity.
    return new THREE.CylinderGeometry(outerRadius, outerRadius, length + padding, 16, 1, false)
  }

  const w = node.width * INCHES_TO_METERS + padding
  const h = node.height * INCHES_TO_METERS + padding
  return new THREE.BoxGeometry(w, length + padding, h)
}

// ============================================================================
// DUCT SEGMENT UPDATE
// ============================================================================

function updateDuctSegmentMesh(node: DuctSegmentNode, group: THREE.Group) {
  // Dispose existing children.
  while (group.children.length > 0) {
    const child = group.children[0] as THREE.Mesh
    child.geometry?.dispose()
    group.remove(child)
  }

  const path = node.path
  if (path.length < 2) return

  const roll = node.roll ?? 0

  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay, az] = path[i]!
    const [bx, by, bz] = path[i + 1]!
    const start = new THREE.Vector3(ax, ay, az)
    const end = new THREE.Vector3(bx, by, bz)
    const seg = buildSegmentMesh(start, end, node)

    // Apply cross-section roll per segment along its local run axis.
    if (roll !== 0) {
      const runDir = new THREE.Vector3(bx - ax, by - ay, bz - az).normalize()
      const rollQ = new THREE.Quaternion().setFromAxisAngle(runDir, roll)
      seg.children.forEach((child) => {
        child.quaternion.premultiply(rollQ)
      })
    }

    group.add(seg)
  }
}

// ============================================================================
// DUCT FITTING UPDATE
// ============================================================================

/**
 * Transition box between two cross-sections — a tapered box approximation.
 * Full swept geometry (elbow arcs, tee branches) is deferred to a future slice.
 */
function updateDuctFittingMesh(node: DuctFittingNode, mesh: THREE.Mesh) {
  mesh.geometry.dispose()

  const bodyLength = 0.3 // 300 mm fitting body
  const w = node.width * INCHES_TO_METERS
  const h = node.height * INCHES_TO_METERS
  const w2 = node.width2 * INCHES_TO_METERS
  const h2 = node.height2 * INCHES_TO_METERS

  // Use the larger of inlet / outlet cross-sections for the box approximation.
  const geo = new THREE.BoxGeometry(
    Math.max(w, w2, node.diameter * INCHES_TO_METERS),
    Math.max(h, h2, node.diameter * INCHES_TO_METERS),
    bodyLength,
  )

  mesh.geometry = geo
  mesh.position.set(...node.position)
  const [rx, ry, rz] = node.rotation
  mesh.rotation.set(rx, ry, rz)
}

// ============================================================================
// DUCT TERMINAL UPDATE
// ============================================================================

/**
 * Flat disc / grille face at the terminal's mount position.
 * Floor / ceiling: CylinderGeometry (disc) or BoxGeometry (rectangular grille).
 * Wall: same geometry rotated 90°.
 */
function updateDuctTerminalMesh(node: DuctTerminalNode, mesh: THREE.Mesh) {
  mesh.geometry.dispose()

  const faceThickness = 0.02 // 20 mm grille depth
  const w = node.width
  const d = node.depth

  let geo: THREE.BufferGeometry
  if (node.collarShape === 'round') {
    const radius = (node.collarDiameter * INCHES_TO_METERS) / 2
    geo = new THREE.CylinderGeometry(radius, radius, faceThickness, 16)
  } else {
    geo = new THREE.BoxGeometry(w, faceThickness, d)
  }

  mesh.geometry = geo

  const [px, py, pz] = node.position
  mesh.position.set(px, py, pz)
  mesh.rotation.set(0, node.rotation, 0)

  // Wall terminals rotate to face outward (tilt 90° around X so the face
  // points along Z rather than up).
  if (node.mount === 'wall') {
    mesh.rotateX(Math.PI / 2)
  }
}

// ============================================================================
// SYSTEM COMPONENT
// ============================================================================

const pendingDuctUpdates = new Set<AnyNodeId>()

export const DuctSystem = () => {
  const dirtyNodes = useScene((state) => state.dirtyNodes)
  const clearDirty = useScene((state) => state.clearDirty)
  const rootNodeIds = useScene((state) => state.rootNodeIds)

  useFrame(() => {
    if (rootNodeIds.length === 0) {
      pendingDuctUpdates.clear()
      return
    }

    if (dirtyNodes.size === 0 && pendingDuctUpdates.size === 0) return

    const nodes = useScene.getState().nodes

    // Collect dirty MEP nodes into the pending queue.
    dirtyNodes.forEach((id) => {
      const node = nodes[id]
      if (
        node?.type === 'duct-segment' ||
        node?.type === 'duct-fitting' ||
        node?.type === 'duct-terminal'
      ) {
        pendingDuctUpdates.add(id as AnyNodeId)
        clearDirty(id as AnyNodeId)
      }
    })

    // Process up to MAX_DUCT_UPDATES_PER_FRAME per frame.
    let processed = 0
    for (const id of pendingDuctUpdates) {
      if (processed >= MAX_DUCT_UPDATES_PER_FRAME) break

      const node = nodes[id]
      if (!node) {
        pendingDuctUpdates.delete(id)
        continue
      }

      if (node.type === 'duct-segment') {
        const group = sceneRegistry.nodes.get(id) as THREE.Group | undefined
        if (group) {
          const effective = getEffectiveNode(node as DuctSegmentNode)
          updateDuctSegmentMesh(effective, group)
          processed++
        }
        pendingDuctUpdates.delete(id)
      } else if (node.type === 'duct-fitting') {
        const mesh = sceneRegistry.nodes.get(id) as THREE.Mesh | undefined
        if (mesh) {
          const effective = getEffectiveNode(node as DuctFittingNode)
          updateDuctFittingMesh(effective, mesh)
          processed++
        }
        pendingDuctUpdates.delete(id)
      } else if (node.type === 'duct-terminal') {
        const mesh = sceneRegistry.nodes.get(id) as THREE.Mesh | undefined
        if (mesh) {
          const effective = getEffectiveNode(node as DuctTerminalNode)
          updateDuctTerminalMesh(effective, mesh)
          processed++
        }
        pendingDuctUpdates.delete(id)
      } else {
        pendingDuctUpdates.delete(id)
      }
    }
  }, 5)

  return null
}
