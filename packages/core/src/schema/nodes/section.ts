import { z } from 'zod'
import { BaseNode, nodeType, objectId } from '../base'

export const SectionNode = BaseNode.extend({
  id: objectId('section'),
  type: nodeType('section'),
  planePosition: z.tuple([z.number(), z.number(), z.number()]).default([0, 2, 0]),
  planeNormal: z.tuple([z.number(), z.number(), z.number()]).default([0, 0, 1]),
  width: z.number().finite().positive().default(20),
  height: z.number().finite().positive().default(6),
  label: z.string().trim().min(1).max(80).default('Section A'),
  showInSheet: z.boolean().default(false),
})

export type SectionNode = z.infer<typeof SectionNode>
