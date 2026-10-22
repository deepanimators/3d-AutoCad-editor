import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'
import { MaterialSchema } from '../material'

export const RailingStyle = z.enum([
  'baluster',      // vertical posts + top rail
  'cable',         // horizontal cables between posts
  'glass',         // glass panels in frame
  'pipe',          // single/double horizontal pipes
  'mesh',          // wire mesh infill
])
export type RailingStyle = z.infer<typeof RailingStyle>

export const RailingTopRailProfile = z.enum(['round', 'square', 'rectangular', 'flat'])
export type RailingTopRailProfile = z.infer<typeof RailingTopRailProfile>

// A path point in local XZ space (Y is vertical)
export const RailingPathPoint = z.object({
  x: z.number(),
  z: z.number(),
})
export type RailingPathPoint = z.infer<typeof RailingPathPoint>

export const RailingNode = BaseNode.extend({
  id: objectId('railing'),
  type: nodeType('railing'),

  // Path in world XZ — defines the railing line; height is perpendicular to path
  path: z.array(RailingPathPoint).min(2).default([{ x: 0, z: 0 }, { x: 3, z: 0 }]),

  // Anchor to a stair or slab (optional — if set, railing follows stair slope)
  hostStairId: objectId('stair').nullable().default(null),
  hostSlabId: objectId('slab').nullable().default(null),

  // Railing height in meters (from floor/host surface to top rail)
  height: z.number().min(0.5).max(2.0).default(1.05),

  // Style
  style: RailingStyle.default('baluster'),
  topRailProfile: RailingTopRailProfile.default('round'),
  topRailDiameter: z.number().min(0.02).max(0.1).default(0.042),

  // Posts
  postSpacing: z.number().min(0.3).max(2.0).default(1.2),
  postDiameter: z.number().min(0.02).max(0.15).default(0.05),

  // Baluster-specific
  balusterSpacing: z.number().min(0.05).max(0.2).default(0.12),
  balusterDiameter: z.number().min(0.01).max(0.05).default(0.02),

  // Cable-specific
  cableCount: z.number().int().min(1).max(8).default(4),
  cableDiameter: z.number().min(0.005).max(0.02).default(0.008),

  // Glass-specific
  glassPanelThickness: z.number().min(0.008).max(0.02).default(0.012),
  glassFramed: z.boolean().default(true),

  // Materials
  material: MaterialSchema.optional(),
  materialPreset: z.string().optional(),
  glassMaterial: MaterialSchema.optional(),

  // Which side of the host to place railing on (for stairs)
  side: z.enum(['left', 'right', 'both']).default('both'),

  // Position and level
  position: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 0]),
  levelId: objectId('level').nullable().default(null),
})

export type RailingNode = z.infer<typeof RailingNode>
