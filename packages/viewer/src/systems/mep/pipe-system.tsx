import { type AnyNodeId, type PipeSegmentNode, sceneRegistry, useScene } from '@aruct/core'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// 1 nominal inch → outer radius in meters. Simple proportional scale — visual
// accuracy matters more than exact schedule-40 OD at architectural scale.
const INCHES_TO_METERS = 0.0254
const DEFAULT_DIAMETER_IN = 2

// Thin insulation blanket thickness in meters.
const INSULATION_THICKNESS_M = 0.012

// Radial segments for pipe cylinders. 10 reads well at typical room scale.
const PIPE_RADIAL_SEGMENTS = 10

// Throttle: update at most this many pipe nodes per frame to avoid frame drops
// on scenes with many dirty pipes.
const MAX_PIPE_UPDATES_PER_FRAME = 4

const pendingPipeUpdates = new Set<AnyNodeId>()

// ============================================================================
// MATERIALS
// ============================================================================

// One material per pipeMaterial enum value, created lazily, never disposed
// (module-lifetime singletons shared by all pipe meshes of the same type).
const materialCache = new Map<string, THREE.MeshStandardMaterial>()

type PipeMaterialKind = PipeSegmentNode['pipeMaterial']

const PIPE_MATERIAL_PARAMS: Record<
  PipeMaterialKind,
  { color: string; metalness: number; roughness: number }
> = {
  pvc: { color: '#e8dcc8', metalness: 0.1, roughness: 0.7 },
  abs: { color: '#2a2a2a', metalness: 0.1, roughness: 0.65 },
  'cast-iron': { color: '#5a5a5a', metalness: 0.7, roughness: 0.4 },
}

function getPipeMaterial(kind: PipeMaterialKind): THREE.MeshStandardMaterial {
  const cached = materialCache.get(kind)
  if (cached) return cached
  const params = PIPE_MATERIAL_PARAMS[kind]
  const mat = new THREE.MeshStandardMaterial(params)
  materialCache.set(kind, mat)
  return mat
}

const insulationMaterial = new THREE.MeshStandardMaterial({
  color: '#f5e6a0',
  metalness: 0.0,
  roughness: 0.9,
  transparent: true,
  opacity: 0.85,
})

// ============================================================================
// SCRATCH VECTORS (avoid per-frame allocations)
// ============================================================================

const _start = new THREE.Vector3()
const _end = new THREE.Vector3()
const _direction = new THREE.Vector3()
const _midpoint = new THREE.Vector3()
const _up = new THREE.Vector3(0, 1, 0)
const _quaternion = new THREE.Quaternion()

// ============================================================================
// GEOMETRY HELPERS
// ============================================================================

function pipeRadiusMeters(diameterIn: number): number {
  return (diameterIn * INCHES_TO_METERS) / 2
}

/**
 * Build a CylinderGeometry oriented along the world-space vector from `start`
 * to `end`, centered at their midpoint. Returns null when points are coincident.
 */
function buildSegmentCylinder(
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
): THREE.BufferGeometry | null {
  _direction.subVectors(end, start)
  const length = _direction.length()
  if (length < 1e-5) return null

  const geo = new THREE.CylinderGeometry(radius, radius, length, PIPE_RADIAL_SEGMENTS)
  _direction.normalize()
  _quaternion.setFromUnitVectors(_up, _direction)
  geo.applyQuaternion(_quaternion)
  _midpoint.addVectors(start, end).multiplyScalar(0.5)
  geo.translate(_midpoint.x, _midpoint.y, _midpoint.z)
  return geo
}

/**
 * Small sphere at a joint point, scaled slightly larger than the pipe radius
 * to cap the cylinder ends cleanly.
 */
function buildJointSphere(point: THREE.Vector3, radius: number): THREE.BufferGeometry {
  const geo = new THREE.SphereGeometry(radius * 1.15, PIPE_RADIAL_SEGMENTS, 8)
  geo.translate(point.x, point.y, point.z)
  return geo
}

/**
 * A single degenerate triangle that draws nothing. Needed to avoid WebGPU
 * "vertex buffer slot 0 not set" errors on empty geometries.
 */
function createEmptyGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(9), 3))
  geo.addGroup(0, 0, 0)
  return geo
}

/**
 * Merge an array of geometries into one, disposing the inputs. If the array is
 * empty, returns an empty geometry.
 */
function mergeAndDispose(geos: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (geos.length === 0) return createEmptyGeometry()
  if (geos.length === 1) return geos[0]!
  const merged = mergeGeometries(geos) ?? createEmptyGeometry()
  for (const g of geos) g.dispose()
  return merged
}

/**
 * Replace the geometry on a mesh, disposing the old one.
 */
function replaceMeshGeometry(mesh: THREE.Mesh, geo: THREE.BufferGeometry) {
  mesh.geometry.dispose()
  mesh.geometry = geo
}

// ============================================================================
// MESH UPDATE
// ============================================================================

/**
 * Rebuild the geometry of a pipe-segment Group. The Group is expected to have
 * named children (created by the React node renderer):
 *   'pipe'        — merged cylinders for each polyline segment
 *   'joints'      — spheres at interior path joints
 *   'insulation'  — optional larger cylinders (visible only when node has insulation)
 *
 * All geometry is rebuilt from the current node state; old geometry is disposed.
 */
function updatePipeSegmentGeometry(node: PipeSegmentNode, group: THREE.Group) {
  const { path, pipeMaterial } = node
  if (path.length < 2) return

  const diameterIn = node.diameter ?? DEFAULT_DIAMETER_IN
  const outerRadius = pipeRadiusMeters(diameterIn)

  // Build per-segment cylinders and interior-joint spheres in one pass.
  const pipeGeos: THREE.BufferGeometry[] = []
  const jointGeos: THREE.BufferGeometry[] = []

  for (let i = 0; i < path.length - 1; i++) {
    const [ax, ay, az] = path[i]!
    const [bx, by, bz] = path[i + 1]!
    _start.set(ax, ay, az)
    _end.set(bx, by, bz)

    const cylinder = buildSegmentCylinder(_start, _end, outerRadius)
    if (cylinder) pipeGeos.push(cylinder)

    // Joint sphere at each interior point (i > 0 → not the start endpoint).
    if (i > 0) {
      jointGeos.push(buildJointSphere(_start, outerRadius))
    }
  }

  // --- Pipe mesh ---
  const pipeMesh = group.getObjectByName('pipe') as THREE.Mesh | undefined
  if (pipeMesh) {
    replaceMeshGeometry(pipeMesh, mergeAndDispose(pipeGeos))
    pipeMesh.material = getPipeMaterial(pipeMaterial)
  } else {
    // No pipe child — dispose to avoid leaks.
    for (const g of pipeGeos) g.dispose()
  }

  // --- Joint spheres mesh ---
  const jointsMesh = group.getObjectByName('joints') as THREE.Mesh | undefined
  if (jointsMesh) {
    replaceMeshGeometry(jointsMesh, mergeAndDispose(jointGeos))
    jointsMesh.material = getPipeMaterial(pipeMaterial)
  } else {
    for (const g of jointGeos) g.dispose()
  }

  // --- Insulation mesh ---
  const insulationMesh = group.getObjectByName('insulation') as THREE.Mesh | undefined
  if (insulationMesh) {
    // `insulation` is not in the current PipeSegmentNode schema; check for it
    // as an optional extension field so future additions work without changes here.
    const hasInsulation = (node as Record<string, unknown>)['insulation'] === true

    if (hasInsulation) {
      const insulRadius = outerRadius + INSULATION_THICKNESS_M
      const insulGeos: THREE.BufferGeometry[] = []
      for (let i = 0; i < path.length - 1; i++) {
        const [ax, ay, az] = path[i]!
        const [bx, by, bz] = path[i + 1]!
        _start.set(ax, ay, az)
        _end.set(bx, by, bz)
        const cylinder = buildSegmentCylinder(_start, _end, insulRadius)
        if (cylinder) insulGeos.push(cylinder)
      }
      replaceMeshGeometry(insulationMesh, mergeAndDispose(insulGeos))
      insulationMesh.material = insulationMaterial
      insulationMesh.visible = true
    } else {
      replaceMeshGeometry(insulationMesh, createEmptyGeometry())
      insulationMesh.visible = false
    }
  }
}

// ============================================================================
// SYSTEM COMPONENT
// ============================================================================

export const PipeSystem = () => {
  const dirtyNodes = useScene((state) => state.dirtyNodes)
  const clearDirty = useScene((state) => state.clearDirty)
  const rootNodeIds = useScene((state) => state.rootNodeIds)

  useFrame(() => {
    if (rootNodeIds.length === 0) {
      pendingPipeUpdates.clear()
      return
    }

    if (dirtyNodes.size === 0 && pendingPipeUpdates.size === 0) return

    const nodes = useScene.getState().nodes

    // Enqueue dirty pipe-segment nodes.
    dirtyNodes.forEach((id) => {
      const node = nodes[id]
      if (node?.type === 'pipe-segment') {
        pendingPipeUpdates.add(id as AnyNodeId)
        clearDirty(id as AnyNodeId)
      }
    })

    // Flush pending updates, throttled to MAX_PIPE_UPDATES_PER_FRAME.
    let processed = 0
    for (const id of pendingPipeUpdates) {
      if (processed >= MAX_PIPE_UPDATES_PER_FRAME) break

      const node = nodes[id]
      if (node?.type !== 'pipe-segment') {
        pendingPipeUpdates.delete(id)
        continue
      }

      const obj = sceneRegistry.nodes.get(id)
      if (!obj) {
        // React renderer hasn't mounted this node yet — leave in pending.
        continue
      }

      if (obj instanceof THREE.Group) {
        updatePipeSegmentGeometry(node as PipeSegmentNode, obj)
        processed++
      }

      pendingPipeUpdates.delete(id)
    }
  }, 5)

  return null
}
