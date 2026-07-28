import type { NodeDefinition } from '@aruct/core'
import { buildCurtainWallGeometry } from './geometry'
import { curtainWallParametrics } from './parametrics'
import { CurtainWallNode } from './schema'

export const curtainWallDefinition: NodeDefinition<typeof CurtainWallNode> = {
  kind: 'curtain-wall',
  schemaVersion: 1,
  schema: CurtainWallNode,
  category: 'structure',

  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    start: [0, 0],
    end: [5, 0],
    height: 3,
    mullionSpacingX: 1.5,
    mullionSpacingY: 1.0,
    mullionWidth: 0.05,
    mullionDepth: 0.1,
    panelType: 'glazing',
    frameColor: '#c0c0c0',
    glazingColor: '#88aabb',
    glazingOpacity: 0.3,
  }),

  capabilities: {
    selectable: { hitVolume: 'bbox' },
    surfaces: { sides: { faces: 'all' } },
    duplicable: true,
    deletable: true,
  },

  parametrics: curtainWallParametrics,

  geometry: buildCurtainWallGeometry,

  presentation: {
    label: 'Curtain Wall',
    description: 'A glazed curtain wall system with configurable mullion and transom grid.',
    icon: { kind: 'url', src: '/icons/wall.webp' },
    paletteSection: 'structure',
    paletteOrder: 25,
  },

  mcp: {
    description:
      'A curtain wall segment defined by start + end points, with configurable mullion/transom grid and panel type.',
  },
}
