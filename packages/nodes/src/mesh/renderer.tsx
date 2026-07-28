'use client'

import { type MeshNode, useRegistry } from '@aruct/core'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function createPrimitiveGeometry(
  primitiveType: MeshNode['primitiveType'],
): THREE.BufferGeometry {
  switch (primitiveType) {
    case 'sphere':
      return new THREE.SphereGeometry(0.5, 16, 12)
    case 'cylinder':
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 16)
    default:
      return new THREE.BoxGeometry(1, 1, 1)
  }
}

export function MeshNodeRenderer({ node }: { node: MeshNode }) {
  const ref = useRef<THREE.Group>(null!)
  useRegistry(node.id, 'mesh', ref)

  const geometry = useMemo(() => {
    if (node.indices.length === 0) {
      return createPrimitiveGeometry(node.primitiveType)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(node.positions, 3))
    if (node.normals.length > 0) {
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(node.normals, 3))
    }
    if (node.uvs.length > 0) {
      geo.setAttribute('uv', new THREE.Float32BufferAttribute(node.uvs, 2))
    }
    geo.setIndex(new THREE.Uint32BufferAttribute(node.indices, 1))
    if (node.normals.length === 0) {
      geo.computeVertexNormals()
    }
    return geo
  }, [node.positions, node.normals, node.uvs, node.indices, node.primitiveType])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group ref={ref} visible={node.visible !== false}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color="#c0c0c0" roughness={0.7} metalness={0} />
      </mesh>
    </group>
  )
}

export default MeshNodeRenderer
