import type { ConstructionDimensionNode, ParametricDescriptor } from '@aruct/core'

export const constructionDimensionParametrics: ParametricDescriptor<ConstructionDimensionNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
