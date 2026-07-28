import type { ParametricDescriptor } from '@aruct/core'
import type { CurtainWallNode } from './schema'

export const curtainWallParametrics: ParametricDescriptor<CurtainWallNode> = {
  groups: [
    {
      label: 'Type',
      fields: [
        {
          key: 'panelType',
          kind: 'enum',
          options: ['glazing', 'spandrel', 'opaque'],
          display: 'segmented',
        },
      ],
    },
    {
      label: 'Dimensions',
      fields: [
        { key: 'height', kind: 'number', unit: 'm', min: 0.5, max: 30, step: 0.1 },
      ],
    },
    {
      label: 'Grid',
      fields: [
        { key: 'mullionSpacingX', kind: 'number', unit: 'm', min: 0.3, max: 6, step: 0.05 },
        { key: 'mullionSpacingY', kind: 'number', unit: 'm', min: 0.3, max: 4, step: 0.05 },
      ],
    },
    {
      label: 'Frame',
      fields: [
        { key: 'mullionWidth', kind: 'number', unit: 'm', min: 0.02, max: 0.2, step: 0.005 },
        { key: 'mullionDepth', kind: 'number', unit: 'm', min: 0.02, max: 0.3, step: 0.005 },
      ],
    },
    {
      label: 'Glass',
      fields: [
        {
          key: 'glazingOpacity',
          kind: 'number',
          unit: '',
          min: 0.05,
          max: 1,
          step: 0.05,
          visibleIf: (n) => n.panelType === 'glazing',
        },
      ],
    },
  ],
}
