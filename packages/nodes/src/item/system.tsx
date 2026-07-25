'use client'

import { ItemLightSystem, ItemSystem } from '@aruct/viewer'

/**
 * Registry-driven item system bundle.
 *
 *  - **`ItemSystem`** — applies attachTo-driven transforms each frame
 *    (wall-side z-offset, slab elevation, ceiling mounting).
 *  - **`ItemLightSystem`** — manages light sources attached to items
 *    (lamps, ceiling lights, etc.).
 */
const ItemSystems = () => {
  return (
    <>
      <ItemSystem />
      <ItemLightSystem />
    </>
  )
}

export default ItemSystems
