'use client'

import { useScene } from '@aruct/core'
import React, { Suspense } from 'react'
import { IfcExportPanel } from './ifc-export-panel'

// Shoelace formula for 2D polygon area
function poly2dArea(polygon: readonly [number, number][]): number {
  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x0, y0] = polygon[i]!
    const [x1, y1] = polygon[(i + 1) % polygon.length]!
    area += x0 * y1 - x1 * y0
  }
  return Math.abs(area) / 2
}

function fmt(n: number, d = 2): string {
  return n.toFixed(d)
}

function SceneSummarySection({ sceneId }: { sceneId?: string }) {
  const nodes = useScene((s) => s.nodes)

  const stats = React.useMemo(() => {
    const allNodes = Object.values(nodes)

    // Wall total length
    let wallLength = 0
    for (const n of allNodes) {
      if (n.type === 'wall') {
        const w = n as { points?: [number, number][]; length?: number }
        if (Array.isArray(w.points) && w.points.length >= 2) {
          for (let i = 0; i < w.points.length - 1; i++) {
            const [x0, z0] = w.points[i]!
            const [x1, z1] = w.points[i + 1]!
            wallLength += Math.hypot(x1 - x0, z1 - z0)
          }
        } else if (typeof w.length === 'number') {
          wallLength += w.length
        }
      }
    }

    // Floor area from slabs
    let slabArea = 0
    for (const n of allNodes) {
      if (n.type === 'slab') {
        const s = n as { polygon?: [number, number][] }
        if (Array.isArray(s.polygon)) slabArea += poly2dArea(s.polygon)
      }
    }

    // Zone count (rooms only)
    const roomCount = allNodes.filter(
      (n) => n.type === 'zone' && (n as { spaceRole?: string }).spaceRole === 'room',
    ).length

    // Windows and walls for window-to-wall ratio
    const windowCount = allNodes.filter((n) => n.type === 'window').length
    const wallCount = allNodes.filter((n) => n.type === 'wall').length

    return { wallLength, slabArea, roomCount, windowCount, wallCount }
  }, [nodes])

  const handleExportMeasurements = () => {
    if (!sceneId) {
      alert('Save your scene to the cloud first to export measurements.')
      return
    }
    const url = `/api/export/measurements?sceneId=${encodeURIComponent(sceneId)}`
    const a = document.createElement('a')
    a.href = url
    a.download = 'measurements.csv'
    a.click()
  }

  return (
    <div className="px-4 py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
        Scene Summary
      </h3>
      <div className="overflow-hidden rounded-xl border border-border/60 divide-y divide-border/40">
        <SummaryRow label="Total Wall Length" value={`${fmt(stats.wallLength)} m`} />
        <SummaryRow label="Total Floor Area" value={`${fmt(stats.slabArea)} m²`} />
        <SummaryRow label="Room Count" value={String(stats.roomCount)} />
        <SummaryRow
          label="Window / Wall Ratio"
          value={stats.wallCount > 0 ? `${fmt(stats.windowCount / stats.wallCount, 2)}` : '—'}
        />
      </div>

      <button
        type="button"
        onClick={handleExportMeasurements}
        className="mt-3 w-full rounded-lg border border-border/60 bg-accent/20 px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors text-left"
      >
        Export Measurements CSV
      </button>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs text-sidebar-foreground/70">{label}</span>
      <span className="text-xs font-medium tabular-nums text-sidebar-foreground">{value}</span>
    </div>
  )
}

export function SettingsPanel({ sceneId }: { sceneId?: string }) {
  return (
    <div className="divide-y divide-border">
      <SceneSummarySection sceneId={sceneId} />
      <Suspense fallback={null}>
        <IfcExportPanel />
      </Suspense>
    </div>
  )
}
