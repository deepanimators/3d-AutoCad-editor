import type { ParametricDescriptor, RoofNode } from '@aruct/core'

export const roofParametrics: ParametricDescriptor<RoofNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
