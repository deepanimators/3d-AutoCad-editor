'use client'

import type { FloorplanPalette } from '@aruct/core'
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'

/**
 * Per-frame render context shared between the legacy `floorplan-panel.tsx`
 * and the registry-driven `<FloorplanRegistryLayer>`.
 *
 * The legacy panel is the authoritative owner of the floor-plan SVG —
 * it computes `unitsPerPixel` from the viewBox / surface size, mounts the
 * pan/zoom `<g>`, and knows the active theme. The registry layer is mounted
 * inside the same `<g>`, so anything it draws shares the same coordinate
 * system; this context plumbs through the bits it can't recompute on its
 * own without re-implementing the legacy's resize / theme logic.
 *
 * Once `floorplan-panel.tsx` is fully migrated (Phase 6), this provider
 * moves into a kind-agnostic 2D editor shell and the context loses the
 * "legacy bridge" connotation.
 */
export type FloorplanRenderContextValue = {
  /** SVG units per screen pixel — used to keep handle radii consistent at any zoom. */
  unitsPerPixel: number
  /** Themed palette mirroring the legacy `FloorplanPalette` accent slots. */
  palette: FloorplanPalette
  /** SVG `<pattern>` id mounted in `<defs>` by the legacy panel for selection hatch fills. */
  hatchPatternId: string
  /**
   * Rotation (degrees) applied to the registry layer's parent `<g>` by the
   * legacy panel — 90° by default, adjusted by building rotation. Renderers
   * that emit text labels use this to keep their final on-screen orientation
   * readable instead of mirroring whatever the parent rotation is.
   */
  sceneRotationDeg: number
  /**
   * Current cursor position in world (scene) coordinates, updated by the
   * SVG `mousemove` handler attached via `useCursorTracker`. `null` when the
   * cursor is outside the canvas or tracking has not been set up.
   */
  cursorPosition: { x: number; y: number } | null
}

const FloorplanRenderContext = createContext<FloorplanRenderContextValue | null>(null)

export function FloorplanRenderProvider({
  children,
  unitsPerPixel,
  palette,
  hatchPatternId,
  sceneRotationDeg,
  cursorPosition = null,
}: Omit<FloorplanRenderContextValue, 'cursorPosition'> & {
  children: ReactNode
  cursorPosition?: { x: number; y: number } | null
}) {
  const value = useMemo<FloorplanRenderContextValue>(
    () => ({ unitsPerPixel, palette, hatchPatternId, sceneRotationDeg, cursorPosition }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitsPerPixel, palette, hatchPatternId, sceneRotationDeg, cursorPosition?.x, cursorPosition?.y],
  )
  return <FloorplanRenderContext.Provider value={value}>{children}</FloorplanRenderContext.Provider>
}

/**
 * Returns a stable `onMouseMove` handler and a `cursorPosition` state value.
 * Attach `onMouseMove` to the SVG element whose coordinate system matches the
 * floorplan world space. The conversion from client coords to world coords
 * requires an `SVGSVGElement` ref and the current viewBox-to-world transform.
 *
 * @param svgRef - ref to the root `<svg>` element
 * @param clientToWorld - converts an `{x, y}` point in SVG client space to
 *   world (scene) coordinates; typically `(pt) => viewportMatrix.inverse().transformPoint(pt)`
 */
export function useCursorTracker(
  svgRef: React.RefObject<SVGSVGElement | null>,
  clientToWorld: (clientPoint: { x: number; y: number }) => { x: number; y: number },
): {
  cursorPosition: { x: number; y: number } | null
  onMouseMove: (e: MouseEvent<SVGSVGElement>) => void
  onMouseLeave: () => void
} {
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
  // Keep clientToWorld stable across renders without stale-closure issues.
  const clientToWorldRef = useRef(clientToWorld)
  clientToWorldRef.current = clientToWorld

  const onMouseMove = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current
      if (svg == null) return
      // Map from client space to SVG local space, then to world coords.
      const pt = svg.createSVGPoint()
      pt.x = e.clientX
      pt.y = e.clientY
      const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
      setCursorPosition(clientToWorldRef.current({ x: svgPt.x, y: svgPt.y }))
    },
    [svgRef],
  )

  const onMouseLeave = useCallback(() => setCursorPosition(null), [])

  return { cursorPosition, onMouseMove, onMouseLeave }
}

/**
 * Read the active render context. Returns `null` when called outside a
 * provider — the registry layer treats this as "render statically, skip
 * theme-aware chrome and interactive handles". This makes the layer
 * usable in isolation tests + future editor shells without bringing the
 * whole legacy panel along.
 */
export function useFloorplanRender(): FloorplanRenderContextValue | null {
  return useContext(FloorplanRenderContext)
}
