import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const TerrainNode = BaseNode.extend({
  id: objectId('terrain'),
  type: nodeType('terrain'),
  // Grid dimensions (number of vertices per axis)
  gridCols: z.number().int().min(2).max(256).default(32),
  gridRows: z.number().int().min(2).max(256).default(32),
  // Physical size in meters
  sizeX: z.number().positive().default(50),
  sizeZ: z.number().positive().default(50),
  // Elevation data: gridCols * gridRows values in meters, row-major order.
  // Empty array = flat terrain at Y=0.
  heights: z.array(z.number()).default([]),
  // Contour display
  showContours: z.boolean().default(true),
  contourInterval: z.number().positive().default(1),
})

export type TerrainNode = z.infer<typeof TerrainNode>
