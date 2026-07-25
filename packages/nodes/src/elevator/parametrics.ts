import type { ElevatorNode, ParametricDescriptor } from '@aruct/core'

export const elevatorParametrics: ParametricDescriptor<ElevatorNode> = {
  groups: [],
  customPanel: () => import('./panel'),
}
