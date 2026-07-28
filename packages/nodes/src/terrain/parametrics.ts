import type { ParametricDescriptor } from '@aruct/core'
import type { TerrainNode } from './schema'

export const terrainParametrics: ParametricDescriptor<TerrainNode> = {
  groups: [
    {
      label: 'Grid',
      fields: [
        { key: 'gridCols', kind: 'number', unit: 'cols', min: 2, max: 256, step: 1 },
        { key: 'gridRows', kind: 'number', unit: 'rows', min: 2, max: 256, step: 1 },
      ],
    },
    {
      label: 'Size',
      fields: [
        { key: 'sizeX', kind: 'number', unit: 'm', min: 1, max: 1000, step: 1 },
        { key: 'sizeZ', kind: 'number', unit: 'm', min: 1, max: 1000, step: 1 },
      ],
    },
    {
      label: 'Contours',
      fields: [
        { key: 'showContours', kind: 'boolean' },
        {
          key: 'contourInterval',
          kind: 'number',
          unit: 'm',
          min: 0.1,
          max: 50,
          step: 0.1,
          visibleIf: (n) => n.showContours,
        },
      ],
    },
  ],
  customPanel: () => import('./panel'),
}
