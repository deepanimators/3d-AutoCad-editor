import { type AnyNodeId, type RailingNode, sceneRegistry, useScene } from '@aruct/core'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const MAX_RAILING_UPDATES_PER_FRAME = 3

const METAL_MATERIAL = new THREE.MeshStandardMaterial({
  color: '#4a5568',
  metalness: 0.7,
  roughness: 0.3,
})

const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  transparent: true,
  opacity: 0.25,
  color: '#c8e6f0',
  roughness: 0,
  transmission: 0.9,
})

function segmentLength(ax: number, az: number, bx: number, bz: number): number {
  const dx = bx - ax
  const dz = bz - az
  return Math.sqrt(dx * dx + dz * dz)
}

function segmentAngle(ax: number, az: number, bx: number, bz: number): number {
  return Math.atan2(bx - ax, bz - az)
}

/** Build a cylinder geometry along XZ with given world position and Y rotation. */
function makeCylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number,
  cx: number,
  cy: number,
  cz: number,
  rotY: number,
): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1)
  // CylinderGeometry is aligned along Y; rotate to lie along Z, then apply world rotation
  geo.rotateZ(Math.PI / 2)
  geo.rotateY(rotY + Math.PI / 2)
  geo.translate(cx, cy, cz)
  return geo
}

/** Build a box geometry for square/flat/rectangular top rail along a segment. */
function makeBox(
  width: number,
  height: number,
  depth: number,
  cx: number,
  cy: number,
  cz: number,
  rotY: number,
): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, height, depth)
  geo.rotateY(rotY)
  geo.translate(cx, cy, cz)
  return geo
}

function buildRailingGeometry(node: RailingNode): {
  metalGeo: THREE.BufferGeometry
  glassGeo: THREE.BufferGeometry | null
} {
  const metalParts: THREE.BufferGeometry[] = []
  const glassParts: THREE.BufferGeometry[] = []

  const { path, height, style, topRailProfile, topRailDiameter } = node
  const postR = node.postDiameter / 2
  const railR = topRailDiameter / 2

  for (let si = 0; si < path.length - 1; si++) {
    const a = path[si]!
    const b = path[si + 1]!
    const len = segmentLength(a.x, a.z, b.x, b.z)
    if (len < 1e-4) continue

    const angle = segmentAngle(a.x, a.z, b.x, b.z)
    const cx = (a.x + b.x) / 2
    const cz = (a.z + b.z) / 2

    // --- Top rail ---
    if (topRailProfile === 'round') {
      metalParts.push(makeCylinder(railR, railR, len, 8, cx, height - railR, cz, angle))
    } else {
      // square / rectangular / flat
      const railW = topRailDiameter
      const railH = topRailProfile === 'flat' ? topRailDiameter * 0.3 : topRailDiameter
      metalParts.push(makeBox(len, railH, railW, cx, height - railH / 2, cz, angle))
    }

    // --- Posts ---
    const postSpacing = Math.max(node.postSpacing, postR * 2 + 0.05)
    const postCount = Math.max(2, Math.floor(len / postSpacing) + 1)
    for (let pi = 0; pi < postCount; pi++) {
      const t = postCount === 1 ? 0.5 : pi / (postCount - 1)
      const px = a.x + (b.x - a.x) * t
      const pz = a.z + (b.z - a.z) * t
      const geo = new THREE.CylinderGeometry(postR, postR, height, 8, 1)
      geo.translate(px, height / 2, pz)
      metalParts.push(geo)
    }

    // --- Style-specific infill ---
    if (style === 'baluster') {
      const balR = node.balusterDiameter / 2
      const balSpacing = Math.max(node.balusterSpacing, balR * 2 + 0.01)
      const balCount = Math.max(0, Math.floor(len / balSpacing) - 1)
      const infillHeight = height - topRailDiameter - 0.02
      for (let bi = 0; bi < balCount; bi++) {
        const t = (bi + 1) / (balCount + 1)
        const bx = a.x + (b.x - a.x) * t
        const bz = a.z + (b.z - a.z) * t
        const geo = new THREE.CylinderGeometry(balR, balR, infillHeight, 6, 1)
        geo.translate(bx, infillHeight / 2 + 0.01, bz)
        metalParts.push(geo)
      }
    } else if (style === 'cable') {
      const cableR = node.cableDiameter / 2
      const count = node.cableCount
      for (let ci = 0; ci < count; ci++) {
        const t = (ci + 1) / (count + 1)
        const cy2 = t * (height - topRailDiameter)
        metalParts.push(makeCylinder(cableR, cableR, len, 5, cx, cy2, cz, angle))
      }
    } else if (style === 'glass') {
      const panelH = height - topRailDiameter - 0.02
      const thickness = node.glassPanelThickness
      const geo = makeBox(len - node.postDiameter, panelH, thickness, cx, panelH / 2 + 0.02, cz, angle)
      glassParts.push(geo)

      if (node.glassFramed) {
        // Bottom frame bar
        const frameR = thickness * 1.5
        metalParts.push(makeBox(len, frameR * 2, frameR * 2, cx, frameR, cz, angle))
      }
    } else if (style === 'pipe') {
      const pipeR = topRailDiameter * 0.6
      // Single mid-height pipe
      const midY = height * 0.5
      metalParts.push(makeCylinder(pipeR, pipeR, len, 8, cx, midY, cz, angle))
      // Second lower pipe if height allows
      if (height > 0.8) {
        const lowY = height * 0.25
        metalParts.push(makeCylinder(pipeR, pipeR, len, 8, cx, lowY, cz, angle))
      }
    } else if (style === 'mesh') {
      // Thin plane approximation for mesh infill — wireframe appearance via material
      const meshH = height - topRailDiameter - 0.02
      const geo = new THREE.PlaneGeometry(len, meshH, Math.ceil(len / 0.1), Math.ceil(meshH / 0.1))
      geo.rotateY(angle)
      geo.translate(cx, meshH / 2 + 0.02, cz)
      metalParts.push(geo)
    }
  }

  const mergedMetal =
    metalParts.length > 0
      ? (mergeGeometries(metalParts, false) ?? new THREE.BufferGeometry())
      : new THREE.BufferGeometry()
  metalParts.forEach((g) => g.dispose())

  let mergedGlass: THREE.BufferGeometry | null = null
  if (glassParts.length > 0) {
    mergedGlass = mergeGeometries(glassParts, false) ?? new THREE.BufferGeometry()
    glassParts.forEach((g) => g.dispose())
  }

  return { metalGeo: mergedMetal, glassGeo: mergedGlass }
}

function updateRailingGeometry(railingId: RailingNode['id']) {
  const node = useScene.getState().nodes[railingId]
  if (node?.type !== 'railing') return

  // Retrieve or create the group
  let group = sceneRegistry.nodes.get(railingId) as THREE.Group | undefined
  if (!group) {
    group = new THREE.Group()
    sceneRegistry.nodes.set(railingId, group)
  }

  // Clear existing children
  while (group.children.length > 0) {
    const child = group.children[0] as THREE.Mesh
    child.geometry?.dispose()
    group.remove(child)
  }

  const { metalGeo, glassGeo } = buildRailingGeometry(node as RailingNode)

  const metalMesh = new THREE.Mesh(metalGeo, METAL_MATERIAL)
  metalMesh.castShadow = true
  metalMesh.receiveShadow = true
  group.add(metalMesh)

  if (glassGeo) {
    const glassMesh = new THREE.Mesh(glassGeo, GLASS_MATERIAL)
    glassMesh.castShadow = false
    glassMesh.receiveShadow = false
    group.add(glassMesh)
  }

  const [px, py, pz] = (node as RailingNode).position
  group.position.set(px, py, pz)
}

export const RailingSystem = () => {
  const dirtyNodes = useScene((state) => state.dirtyNodes)
  const clearDirty = useScene((state) => state.clearDirty)

  useFrame(() => {
    if (dirtyNodes.size === 0) return

    const nodes = useScene.getState().nodes
    let updatesThisFrame = 0

    dirtyNodes.forEach((id) => {
      if (updatesThisFrame >= MAX_RAILING_UPDATES_PER_FRAME) return
      const node = nodes[id]
      if (node?.type !== 'railing') return
      updateRailingGeometry(id as RailingNode['id'])
      clearDirty(id as AnyNodeId)
      updatesThisFrame++
    })
  }, 4)

  return null
}
