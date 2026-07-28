import { type NodeDefinition, PointCloudNode as PointCloudNodeSchema } from '@aruct/core'
import { pointCloudParametrics } from './parametrics'

export const pointCloudDefinition: NodeDefinition<typeof PointCloudNodeSchema> = {
  kind: 'point-cloud',
  bake: 'strip',
  schemaVersion: 1,
  schema: PointCloudNodeSchema,
  category: 'site',

  defaults: () => {
    const stub = PointCloudNodeSchema.parse({
      id: 'point-cloud_default' as never,
      type: 'point-cloud',
    })
    const { id: _id, type: _type, ...rest } = stub
    return rest
  },

  capabilities: {
    selectable: { hitVolume: 'bbox' },
    duplicable: false,
    deletable: true,
    presettable: false,
  },

  parametrics: pointCloudParametrics,

  renderer: {
    kind: 'parametric',
    module: () => import('./renderer'),
  },

  presentation: {
    label: 'Point Cloud',
    description: 'A point cloud imported from a LiDAR or photogrammetry scan (.laz / .e57).',
    icon: { kind: 'url', src: '/icons/mesh.webp' },
    paletteSection: 'site',
    paletteOrder: 50,
  },

  mcp: {
    description: 'A point cloud import stub.',
  },
}
