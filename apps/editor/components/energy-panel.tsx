'use client'

import { type WallNode, type WindowNode, type ZoneNode, useScene } from '@aruct/core'
import { Zap } from 'lucide-react'
import { useState } from 'react'

// Shoelace formula for polygon area in m²
function polygonArea(polygon: [number, number][]): number {
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const [x1, y1] = polygon[i]
    const [x2, y2] = polygon[(i + 1) % n]
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area / 2)
}

function wallLength(wall: WallNode): number {
  const dx = wall.end[0] - wall.start[0]
  const dy = wall.end[1] - wall.start[1]
  return Math.sqrt(dx * dx + dy * dy)
}

const BASELINE_EUI = 200 // kWh/m²/yr (office baseline)

type UValueMap = Record<string, number>

export function EnergyPanel() {
  const nodes = useScene((s) => s.nodes)
  const [uValues, setUValues] = useState<UValueMap>({})
  const [result, setResult] = useState<{
    totalArea: number
    wallArea: number
    windowArea: number
    glazingRatio: number
    adjustedEUI: number
  } | null>(null)

  const nodeList = Object.values(nodes)
  const zones = nodeList.filter((n): n is ZoneNode => n.type === 'zone')
  const walls = nodeList.filter((n): n is WallNode => n.type === 'wall')
  const windows = nodeList.filter((n): n is WindowNode => n.type === 'window')

  const handleEstimate = () => {
    const totalArea = zones.reduce((sum, z) => sum + polygonArea(z.polygon), 0)
    const wallHeight = 2.7 // default ceiling height
    const wallArea = walls.reduce((sum, w) => sum + wallLength(w) * wallHeight, 0)
    const windowArea = windows.reduce((sum, w) => sum + w.width * w.height, 0)
    const combined = wallArea + windowArea
    const glazingRatio = combined > 0 ? windowArea / combined : 0
    const adjustedEUI = BASELINE_EUI * (0.8 + glazingRatio * 0.4)
    setResult({ totalArea, wallArea, windowArea, glazingRatio, adjustedEUI })
  }

  const maxEUI = BASELINE_EUI * 1.2 // 240 for 100% bar width reference

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <Zap className="h-4 w-4 text-sidebar-foreground/60" />
        <h2 className="text-sm font-semibold text-sidebar-foreground">Zone-level Energy Analysis</h2>
      </div>

      {zones.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No zone nodes in the scene. Add zones to estimate energy use.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            {zones.map((zone) => {
              const area = polygonArea(zone.polygon)
              return (
                <div key={zone.id} className="rounded-xl border border-border/60 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-sidebar-foreground">
                      {zone.name || 'Unnamed Zone'}
                    </span>
                    <span className="text-xs tabular-nums text-sidebar-foreground/50">
                      {area.toFixed(1)} m²
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="w-16 shrink-0 text-xs text-sidebar-foreground/50">
                      U-value
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      max={5}
                      step={0.1}
                      placeholder="W/m²K"
                      value={uValues[zone.id] ?? ''}
                      onChange={(e) =>
                        setUValues((prev) => ({ ...prev, [zone.id]: parseFloat(e.target.value) }))
                      }
                      className="w-24 rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                    />
                    <span className="text-xs text-sidebar-foreground/40">W/m²K</span>
                  </div>
                </div>
              )
            })}
          </div>

          <button
            type="button"
            onClick={handleEstimate}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Estimate EUI
          </button>

          {result && (
            <div className="flex flex-col gap-3 rounded-xl border border-border/60 px-3 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                Results
              </p>

              <div className="flex flex-col gap-1.5 text-xs text-sidebar-foreground/70">
                <Row label="Total floor area" value={`${result.totalArea.toFixed(1)} m²`} />
                <Row label="Wall area" value={`${result.wallArea.toFixed(1)} m²`} />
                <Row label="Window area" value={`${result.windowArea.toFixed(1)} m²`} />
                <Row
                  label="Glazing ratio"
                  value={`${(result.glazingRatio * 100).toFixed(1)}%`}
                />
              </div>

              <div className="mt-1">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-sidebar-foreground">Adjusted EUI</span>
                  <span className="tabular-nums font-semibold text-sidebar-foreground">
                    {result.adjustedEUI.toFixed(0)} kWh/m²/yr
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-accent/30">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((result.adjustedEUI / maxEUI) * 100, 100)}%` }}
                  />
                </div>
                <div className="mt-0.5 flex justify-between text-[10px] text-sidebar-foreground/40">
                  <span>0</span>
                  <span>Baseline {BASELINE_EUI}</span>
                  <span>{maxEUI}</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-xs text-sidebar-foreground/40">
            Note: Full EnergyPlus integration coming in Team plan v2
          </p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="tabular-nums text-sidebar-foreground">{value}</span>
    </div>
  )
}
