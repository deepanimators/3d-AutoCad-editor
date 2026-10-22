'use client'

import { type AnyNodeId, type TerrainNode, sceneRegistry, useScene } from '@aruct/core'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
} from 'three'

const TERRAIN_COLOR = new Color('#7a8c6e')
const TERRAIN_ROUGHNESS = 0.9
const TERRAIN_METALNESS = 0.0

// Subdivisions for the terrain plane — provides adequate vertex density for
// height displacement regardless of gridCols/gridRows.
const PLANE_SEGMENTS = 128

function buildTerrainFromHeights(node: TerrainNode): Group {
  const group = new Group()

  const { gridCols, gridRows, sizeX, sizeZ, heights } = node
  const vertexCount = gridCols * gridRows

  // Build a PlaneGeometry with the terrain's own grid resolution so each
  // schema vertex maps 1:1 to a geometry vertex.
  const geo = new PlaneGeometry(sizeX, sizeZ, gridCols - 1, gridRows - 1)
  // PlaneGeometry is in XY plane — rotate to XZ so it lies flat.
  geo.rotateX(-Math.PI / 2)

  // Displace Y positions from the heights array (row-major, origin top-left).
  const positions = geo.attributes.position as BufferAttribute
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const schemaIndex = row * gridCols + col
      const height = schemaIndex < heights.length ? (heights[schemaIndex] ?? 0) : 0
      // PlaneGeometry after rotateX lays out vertices row by row.
      const geoIndex = row * gridCols + col
      positions.setY(geoIndex, height)
    }
  }
  positions.needsUpdate = true
  geo.computeVertexNormals()

  const material = new MeshStandardMaterial({
    color: TERRAIN_COLOR,
    roughness: TERRAIN_ROUGHNESS,
    metalness: TERRAIN_METALNESS,
    side: DoubleSide,
  })

  const mesh = new Mesh(geo, material)
  mesh.receiveShadow = true
  mesh.castShadow = false
  group.add(mesh)

  return group
}

function buildFlatTerrain(node: TerrainNode): Group {
  const group = new Group()

  const { sizeX, sizeZ } = node

  // Solid surface mesh
  const geo = new PlaneGeometry(sizeX, sizeZ, PLANE_SEGMENTS, PLANE_SEGMENTS)
  geo.rotateX(-Math.PI / 2)

  const material = new MeshStandardMaterial({
    color: TERRAIN_COLOR,
    roughness: TERRAIN_ROUGHNESS,
    metalness: TERRAIN_METALNESS,
    side: DoubleSide,
  })

  const mesh = new Mesh(geo, material)
  mesh.receiveShadow = true
  mesh.castShadow = false
  group.add(mesh)

  // Wireframe overlay for flat terrain — provides a subtle grid so the
  // terrain extent is legible in the scene without a heightmap.
  const wireGeo = new PlaneGeometry(sizeX, sizeZ, PLANE_SEGMENTS, PLANE_SEGMENTS)
  wireGeo.rotateX(-Math.PI / 2)

  const wireMaterial = new MeshStandardMaterial({
    color: new Color('#5a6b50'),
    roughness: 1,
    metalness: 0,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  })

  const wireMesh = new Mesh(wireGeo, wireMaterial)
  // Slight Y offset to avoid z-fighting with the solid mesh.
  wireMesh.position.y = 0.002
  group.add(wireMesh)

  return group
}

function buildTerrainGroup(node: TerrainNode): Group {
  const hasHeights = node.heights.length > 0

  const group = hasHeights ? buildTerrainFromHeights(node) : buildFlatTerrain(node)

  // Position the group at the node's origin. The node's own position is set by
  // the renderer; children are offset here so the plane is centered on origin.
  group.position.set(0, 0, 0)

  return group
}

function disposeGroup(group: Group) {
  for (const child of [...group.children]) {
    const mesh = child as Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    if (mesh.material) {
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const mat of mats) mat.dispose()
    }
  }
}

function updateTerrain(nodeId: TerrainNode['id']) {
  const node = useScene.getState().nodes[nodeId] as TerrainNode | undefined
  if (node?.type !== 'terrain') return

  const registered = sceneRegistry.nodes.get(nodeId) as Group | undefined
  if (!registered) return // renderer hasn't mounted yet — stay dirty

  const built = buildTerrainGroup(node)

  // Swap children: dispose old builder output, reparent new children.
  disposeGroup(registered)
  for (const child of [...built.children]) {
    registered.add(child)
  }

  // Position is managed by the renderer via JSX props; leave it untouched.
}

/**
 * TerrainSystem
 *
 * Rebuilds terrain meshes for every dirty terrain node each frame.
 * - Nodes with `heights` data get per-vertex displacement from the array.
 * - Flat nodes (empty `heights`) get a solid plane + semi-transparent
 *   wireframe overlay so the terrain boundary reads clearly.
 *
 * Priority 4 matches other geometry-heavy systems (fence) — runs after
 * position transforms from lower-priority systems have settled.
 */
export const TerrainSystem = () => {
  const dirtyNodes = useScene((state) => state.dirtyNodes)
  const clearDirty = useScene((state) => state.clearDirty)

  // Track which terrain IDs we have built so we can dispose on unmount.
  const builtIds = useRef<Set<string>>(new Set())

  useFrame(() => {
    if (dirtyNodes.size === 0) return

    const nodes = useScene.getState().nodes

    dirtyNodes.forEach((id) => {
      const node = nodes[id]
      if (node?.type !== 'terrain') return

      updateTerrain(id as TerrainNode['id'])
      builtIds.current.add(id)
      clearDirty(id as AnyNodeId)
    })
  }, 4)

  return null
}
