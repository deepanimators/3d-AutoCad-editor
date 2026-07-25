import type { ParametricDescriptor, ZoneNode } from '@aruct/core'

export const zoneParametrics: ParametricDescriptor<ZoneNode> = {
  groups: [],
  trailingSection: () => import('./quantities-panel'),
}
