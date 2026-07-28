import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const PointCloudNode = BaseNode.extend({
  id: objectId('point-cloud'),
  type: nodeType('point-cloud'),
  fileUrl: z.string().optional(),
  fileName: z.string().default(''),
  pointCount: z.number().default(0),
  boundingBox: z
    .object({
      min: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
      max: z.tuple([z.number(), z.number(), z.number()]).default([10, 10, 3]),
    })
    .default({ min: [0, 0, 0], max: [10, 10, 3] }),
  colorMode: z.enum(['intensity', 'rgb', 'elevation']).default('elevation'),
  pointSize: z.number().positive().default(0.02),
  opacity: z.number().min(0).max(1).default(1),
})

export type PointCloudNode = z.infer<typeof PointCloudNode>
