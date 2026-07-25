import type { ParametricDescriptor, StairSegmentNode } from '@aruct/core'

export const stairSegmentParametrics: ParametricDescriptor<StairSegmentNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
