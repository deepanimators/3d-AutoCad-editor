import type { ParametricDescriptor, StairNode } from '@aruct/core'

export const stairParametrics: ParametricDescriptor<StairNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
