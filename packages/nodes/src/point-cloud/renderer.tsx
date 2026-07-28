'use client'

import { type PointCloudNode } from '@aruct/core'
import { BoxGeometry } from 'three'

export function PointCloudRenderer({ node }: { node: PointCloudNode }) {
  const { min, max } = node.boundingBox
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]] as const
  const center = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2] as const

  return (
    <lineSegments position={center}>
      <edgesGeometry args={[new BoxGeometry(...size)]} />
      <lineBasicMaterial color="#44aaff" opacity={0.6} transparent />
    </lineSegments>
  )
}

export default PointCloudRenderer
