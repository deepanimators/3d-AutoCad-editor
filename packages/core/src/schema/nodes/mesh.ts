import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const MeshNode = BaseNode.extend({
  id: objectId('mesh'),
  type: nodeType('mesh'),
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  positions: z.array(z.number()).default([]),
  normals: z.array(z.number()).default([]),
  uvs: z.array(z.number()).default([]),
  indices: z.array(z.number()).default([]),
  primitiveType: z.enum(['box', 'sphere', 'cylinder', 'custom']).default('box'),
})

export type MeshNode = z.infer<typeof MeshNode>
