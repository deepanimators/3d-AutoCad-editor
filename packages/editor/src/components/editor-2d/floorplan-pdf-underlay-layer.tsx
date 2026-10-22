'use client'
/**
 * Renders pdf-underlay nodes as background images in the 2D floorplan canvas.
 *
 * Positioning: the node stores world-space origin (originX, originZ) and real
 * dimensions in meters. The caller supplies the current canvas transform so we
 * can convert world → pixel coords. The layer sits behind all drawing chrome
 * via pointer-events:none.
 */
import { useScene } from '@aruct/core'
import type { PdfUnderlayNode } from '@aruct/core'

interface CanvasTransform {
  /** Pixels per world-unit (meter) */
  scale: number
  /** Canvas x-offset in pixels (world origin → canvas origin) */
  tx: number
  /** Canvas y-offset in pixels (world origin → canvas origin) */
  ty: number
}

interface Props {
  canvasTransform: CanvasTransform
}

export function FloorplanPdfUnderlayLayer({ canvasTransform }: Props) {
  const nodes = useScene((s) =>
    Object.values(s.nodes).filter(
      (n): n is PdfUnderlayNode => n.type === 'pdf-underlay',
    ),
  )

  if (nodes.length === 0) return null

  const { scale, tx, ty } = canvasTransform

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {nodes.map((n) => {
        if (!n.visible || !n.imageUrl) return null

        const left = n.originX * scale + tx
        const top = n.originZ * scale + ty
        const width = n.pageWidthMeters * scale
        const height = n.pageHeightMeters * scale

        return (
          <img
            key={n.id}
            src={n.imageUrl}
            alt={n.name ?? 'PDF underlay'}
            style={{
              position: 'absolute',
              left,
              top,
              width,
              height,
              opacity: n.opacity,
              transform: `rotate(${n.rotation}rad)`,
              transformOrigin: 'top left',
              imageRendering: 'pixelated',
            }}
          />
        )
      })}
    </div>
  )
}
