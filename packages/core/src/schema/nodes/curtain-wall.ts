import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const CurtainWallPanelType = z.enum(['glazing', 'spandrel', 'opaque'])

export const CurtainWallNode = BaseNode.extend({
  id: objectId('curtain-wall'),
  type: nodeType('curtain-wall'),
  // 2D plan endpoints in level coordinate system (same convention as FenceNode)
  start: z.tuple([z.number(), z.number()]).default([0, 0]),
  end: z.tuple([z.number(), z.number()]).default([5, 0]),
  height: z.number().positive().default(3),
  // Grid: spacing between mullions (vertical members) and transoms (horizontal members)
  mullionSpacingX: z.number().positive().default(1.5),
  mullionSpacingY: z.number().positive().default(1.0),
  // Frame profile dimensions
  mullionWidth: z.number().positive().default(0.05),
  mullionDepth: z.number().positive().default(0.1),
  // Panel fill type
  panelType: CurtainWallPanelType.default('glazing'),
  frameColor: z.string().default('#c0c0c0'),
  glazingColor: z.string().default('#88aabb'),
  glazingOpacity: z.number().min(0).max(1).default(0.3),
})

export type CurtainWallNode = z.infer<typeof CurtainWallNode>
