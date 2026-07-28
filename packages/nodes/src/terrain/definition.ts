import type { NodeDefinition } from '@aruct/core'
import { buildTerrainFloorplan } from './floorplan'
import { buildTerrainGeometry } from './geometry'
import { terrainParametrics } from './parametrics'
import { TerrainNode } from './schema'

export const terrainDefinition: NodeDefinition<typeof TerrainNode> = {
  kind: 'terrain',
  snapProfile: 'structural',
  schemaVersion: 1,
  schema: TerrainNode,
  category: 'structure',
  surfaceRole: 'floor',

  defaults: () => ({
    object: 'node',
    parentId: null,
    visible: true,
    metadata: {},
    gridCols: 32,
    gridRows: 32,
    sizeX: 50,
    sizeZ: 50,
    heights: [],
    showContours: true,
    contourInterval: 1,
  }),

  capabilities: {
    selectable: { hitVolume: 'bbox' },
    duplicable: true,
    deletable: true,
  },

  parametrics: terrainParametrics,

  geometry: buildTerrainGeometry,

  floorplan: buildTerrainFloorplan,

  presentation: {
    label: 'Terrain',
    description: 'A grid-based terrain surface with elevation control.',
    icon: { kind: 'url', src: '/icons/terrain.webp' },
    paletteSection: 'structure',
    paletteOrder: 35,
  },

  mcp: {
    description: 'A grid-based terrain surface with a height map and optional contour lines.',
  },
}
