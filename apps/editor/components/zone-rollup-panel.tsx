'use client'

import { deriveZoneQuantityReport, useScene, type ZoneNode } from '@aruct/core'
import React from 'react'

function polygonArea(polygon: readonly [number, number][]): number {
  let area = 0
  for (let i = 0; i < polygon.length; i++) {
    const [x0, y0] = polygon[i]!
    const [x1, y1] = polygon[(i + 1) % polygon.length]!
    area += x0 * y1 - x1 * y0
  }
  return Math.abs(area) / 2
}

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals)
}

function zonesToCsv(zones: ZoneNode[], allNodes: Record<string, unknown>): string {
  const header = 'Name,Room Number,Space Role,Floor Area (m²),Perimeter (m),Ceiling Height (m),Floor Finish,Wall Finish,Ceiling Finish'
  const rows = zones.map((zone) => {
    const report = deriveZoneQuantityReport(zone, allNodes as never)
    return [
      zone.name || '(unnamed)',
      zone.roomNumber || '',
      zone.spaceRole,
      fmt(report.footprintArea),
      fmt(report.perimeter),
      fmt(zone.ceilingHeight),
      zone.floorFinish || '',
      zone.wallFinish || '',
      zone.ceilingFinish || '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  })
  return [header, ...rows].join('\n')
}

export function ZoneRollupPanel() {
  const nodes = useScene((s) => s.nodes)

  const zones = React.useMemo(
    () => Object.values(nodes).filter((n): n is ZoneNode => n.type === 'zone'),
    [nodes],
  )

  const { totalArea, roomZones, genericZones } = React.useMemo(() => {
    let total = 0
    const rooms: ZoneNode[] = []
    const generic: ZoneNode[] = []
    for (const zone of zones) {
      const area = polygonArea(zone.polygon)
      total += area
      if (zone.spaceRole === 'room') rooms.push(zone)
      else generic.push(zone)
    }
    return { totalArea: total, roomZones: rooms, genericZones: generic }
  }, [zones])

  const handleExportCsv = () => {
    const csv = zonesToCsv(zones, nodes)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'zone-areas.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Zone Summary</h2>
        {zones.length > 0 && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {zones.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">No zones in scene. Add zone nodes to see area rollups.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {/* Totals */}
          <div className="rounded-xl border border-border/60 bg-accent/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">Total Floor Area</span>
              <span className="text-sm font-semibold tabular-nums text-sidebar-foreground">{fmt(totalArea)} m²</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-sidebar-foreground/50">{zones.length} zone{zones.length === 1 ? '' : 's'}</span>
              <span className="text-xs text-sidebar-foreground/50">{roomZones.length} room{roomZones.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          {/* Rooms */}
          {roomZones.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Rooms
              </h3>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/60 bg-accent/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                  <span>Name</span>
                  <span className="text-right">Area</span>
                  <span className="min-w-[60px] text-right">Height</span>
                </div>
                {roomZones.map((zone) => {
                  const area = polygonArea(zone.polygon)
                  return (
                    <div
                      key={zone.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 text-sm odd:bg-accent/10 even:bg-transparent"
                    >
                      <span className="truncate text-sidebar-foreground">
                        {zone.name || '(unnamed)'}
                        {zone.roomNumber ? <span className="ml-1 text-[10px] text-sidebar-foreground/40">#{zone.roomNumber}</span> : null}
                      </span>
                      <span className="text-right tabular-nums text-sidebar-foreground/70 text-xs">
                        {fmt(area)} m²
                      </span>
                      <span className="min-w-[60px] text-right tabular-nums text-sidebar-foreground/50 text-xs">
                        {fmt(zone.ceilingHeight)} m
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Generic zones */}
          {genericZones.length > 0 && (
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Other Zones
              </h3>
              <div className="overflow-hidden rounded-xl border border-border/60">
                <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-border/60 bg-accent/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                  <span>Name</span>
                  <span className="text-right">Area</span>
                </div>
                {genericZones.map((zone) => {
                  const area = polygonArea(zone.polygon)
                  return (
                    <div
                      key={zone.id}
                      className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-sm odd:bg-accent/10 even:bg-transparent"
                    >
                      <span className="truncate text-sidebar-foreground">{zone.name || '(unnamed)'}</span>
                      <span className="text-right tabular-nums text-sidebar-foreground/70 text-xs">{fmt(area)} m²</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
