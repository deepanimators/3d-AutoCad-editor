import { z } from 'zod'
import { generateId } from './base'
import { MaterialMapsSchema, MaterialMapPropertiesSchema, MaterialSchema } from './material'

export type SceneMaterialId = `mat_${string}`
export const generateSceneMaterialId = (): SceneMaterialId => generateId('mat')

export const SceneMaterial = z.object({
  id: z.string(),
  name: z.string(),
  material: MaterialSchema,
  maps: MaterialMapsSchema.optional(),
  mapProperties: MaterialMapPropertiesSchema.optional(),
})
export type SceneMaterial = z.infer<typeof SceneMaterial>
