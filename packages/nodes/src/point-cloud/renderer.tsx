'use client'

import { type PointCloudNode, useRegistry } from '@aruct/core'
import { useRef } from 'react'
import * as THREE from 'three'

export function PointCloudRenderer({ node }: { node: PointCloudNode }) {
  const ref = useRef<THREE.Group>(null!)
  useRegistry(node.id, 'point-cloud', ref)

  const { min, max } = node.boundingBox
  const size: [number, number, number] = [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
  const center: [number, number, number] = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ]

  return (
    <group ref={ref} visible={node.visible !== false} position={node.position} rotation={node.rotation}>
      <lineSegments position={center}>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color="#44aaff" opacity={0.6} transparent />
      </lineSegments>
    </group>
  )
}

export default PointCloudRenderer
