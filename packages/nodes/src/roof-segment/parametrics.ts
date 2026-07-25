import type { ParametricDescriptor, RoofSegmentNode } from '@aruct/core'

export const roofSegmentParametrics: ParametricDescriptor<RoofSegmentNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
