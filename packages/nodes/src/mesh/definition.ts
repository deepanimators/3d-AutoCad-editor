import { MeshNode as MeshNodeSchema, type NodeDefinition } from '@aruct/core'
import { meshParametrics } from './parametrics'
import { MeshNode } from './schema'

export const meshDefinition: NodeDefinition<typeof MeshNode> = {
  kind: 'mesh',
  schemaVersion: 1,
  schema: MeshNode,
  category: 'utility',

  defaults: () => {
    const stub = MeshNodeSchema.parse({ id: 'mesh_default' as never, type: 'mesh' })
    const { id: _id, type: _type, ...rest } = stub
    return rest
  },

  capabilities: {
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
    presettable: false,
  },

  parametrics: meshParametrics,
  dirtyTracking: false,

  renderer: {
    kind: 'parametric',
    module: () => import('./renderer'),
  },

  tool: () => import('./tool'),

  toolHints: [
    { key: 'Left click', label: 'Place mesh' },
    { key: 'Esc', label: 'Cancel' },
  ],

  presentation: {
    label: 'Mesh',
    description: 'A 3D mesh primitive (box, sphere, cylinder) or custom geometry.',
    icon: { kind: 'iconify', name: 'mdi:cube-outline' },
    paletteSection: undefined,
    paletteOrder: 10,
  },

  mcp: {
    description: 'A 3D mesh node with configurable geometry type.',
  },
}
