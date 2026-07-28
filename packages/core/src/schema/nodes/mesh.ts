import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const MeshNode = BaseNode.extend({
  id: objectId('mesh'),
  type: nodeType('mesh'),
  positions: z.array(z.number()).default([]),  // Float32, stride 3
  normals: z.array(z.number()).default([]),     // Float32, stride 3
  uvs: z.array(z.number()).default([]),         // Float32, stride 2
  indices: z.array(z.number()).default([]),     // Uint32
  primitiveType: z.enum(['box', 'sphere', 'cylinder', 'custom']).default('box'),
})

export type MeshNode = z.infer<typeof MeshNode>
