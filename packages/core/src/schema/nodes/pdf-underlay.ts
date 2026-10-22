import { z } from 'zod'
import { AssetUrl } from '../asset-url'
import { BaseNode, nodeType, objectId } from '../base'

export const PdfUnderlayNode = BaseNode.extend({
  id: objectId('pdf-underlay'),
  type: nodeType('pdf-underlay'),
  // blob URL or storage URL of the rendered PNG for this page
  imageUrl: AssetUrl,
  // Real-world dimensions set during calibration
  pageWidthMeters: z.number().positive(),
  pageHeightMeters: z.number().positive(),
  // World-space position of the top-left corner (X, Z in world coords)
  originX: z.number().default(0),
  originZ: z.number().default(0),
  // Rotation around the vertical axis, in radians
  rotation: z.number().default(0),
  // Opacity 0–1
  opacity: z.number().min(0).max(1).default(0.5),
  levelId: objectId('level').nullable().default(null),
})

export type PdfUnderlayNode = z.infer<typeof PdfUnderlayNode>
