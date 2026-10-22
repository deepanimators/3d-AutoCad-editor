'use client'

import type { ReactElement } from 'react'

export type FloorplanStatusBarProps = {
  cursorPosition: { x: number; y: number } | null
  unit: string
  selectedCount: number
  activeTool: string | null
}

/**
 * Fixed status bar rendered at the bottom of the 2D floorplan canvas.
 * Shows cursor world coordinates, active tool, and selection count.
 *
 * The parent panel is responsible for converting mouse-event canvas
 * coordinates to world coordinates and passing them here.
 */
export function FloorplanStatusBar({
  cursorPosition,
  unit,
  selectedCount,
  activeTool,
}: FloorplanStatusBarProps): ReactElement {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex items-center gap-4 bg-black/60 px-3 py-1 text-xs font-mono text-white/80 backdrop-blur-sm select-none">
      {cursorPosition != null ? (
        <span>
          X: {cursorPosition.x.toFixed(3)} {unit}&nbsp;&nbsp;Y: {cursorPosition.y.toFixed(3)}{' '}
          {unit}
        </span>
      ) : (
        <span className="text-white/40">—</span>
      )}

      {activeTool != null && (
        <>
          <span className="text-white/30">|</span>
          <span className="capitalize">{activeTool}</span>
        </>
      )}

      {selectedCount > 0 && (
        <>
          <span className="text-white/30">|</span>
          <span>
            {selectedCount} selected
          </span>
        </>
      )}
    </div>
  )
}
