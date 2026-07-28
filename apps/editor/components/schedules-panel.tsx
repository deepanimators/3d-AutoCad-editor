'use client'

import { type AnyNode, useScene } from '@aruct/core'
import React, { useMemo, useState } from 'react'

type ScheduleType = 'doors' | 'windows' | 'rooms' | 'items'

type DoorNode = Extract<AnyNode, { type: 'door' }>
type WindowNode = Extract<AnyNode, { type: 'window' }>
type ZoneNode = Extract<AnyNode, { type: 'zone' }>
type ItemNode = Extract<AnyNode, { type: 'item' }>

type AnySceneNode = AnyNode

const SCHEDULE_TYPES: { id: ScheduleType; label: string }[] = [
  { id: 'doors', label: 'Door Schedule' },
  { id: 'windows', label: 'Window Schedule' },
  { id: 'rooms', label: 'Room Schedule' },
  { id: 'items', label: 'Item Schedule' },
]

function shortMark(id: string): string {
  return id.slice(-4).toUpperCase()
}

function polygonArea(polygon: [number, number][]): number {
  let area = 0
  const n = polygon.length
  for (let i = 0; i < n; i++) {
    const [x1, z1] = polygon[i]!
    const [x2, z2] = polygon[(i + 1) % n]!
    area += x1 * z2 - x2 * z1
  }
  return Math.abs(area) / 2
}

type TableRow = (string | number | null)[]
type TableConfig = { headers: string[]; rows: TableRow[] }

function buildTable(nodes: Record<string, AnySceneNode>, type: ScheduleType): TableConfig {
  switch (type) {
    case 'doors': {
      const headers = ['Mark', 'Type', 'Width (m)', 'Height (m)', 'Category', 'Construction', 'Leaves']
      const rows: TableRow[] = []
      for (const node of Object.values(nodes)) {
        if (node.type !== 'door') continue
        const d = node as DoorNode
        rows.push([
          d.mark ?? shortMark(d.id),
          d.doorType ?? '',
          d.width,
          d.height,
          d.doorCategory ?? '',
          d.constructionType ?? '',
          d.leafCount ?? 1,
        ])
      }
      rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      return { headers, rows }
    }
    case 'windows': {
      const headers = ['Mark', 'Type', 'Width (m)', 'Height (m)', 'Construction']
      const rows: TableRow[] = []
      for (const node of Object.values(nodes)) {
        if (node.type !== 'window') continue
        const w = node as WindowNode
        rows.push([
          w.mark ?? shortMark(w.id),
          w.windowType ?? '',
          w.width,
          w.height,
          w.constructionType ?? '',
        ])
      }
      rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      return { headers, rows }
    }
    case 'rooms': {
      const headers = ['Room #', 'Name', 'Area (m²)', 'Ceiling (m)', 'Floor Finish', 'Wall Finish', 'Ceiling Finish']
      const rows: TableRow[] = []
      for (const node of Object.values(nodes)) {
        if (node.type !== 'zone') continue
        const z = node as ZoneNode
        if (z.spaceRole !== 'room') continue
        const area =
          z.polygon && z.polygon.length >= 3
            ? Number(polygonArea(z.polygon as [number, number][]).toFixed(2))
            : null
        rows.push([
          z.roomNumber ?? '',
          z.name ?? '',
          area,
          z.ceilingHeight ?? 2.7,
          z.floorFinish ?? '',
          z.wallFinish ?? '',
          z.ceilingFinish ?? '',
        ])
      }
      rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])))
      return { headers, rows }
    }
    case 'items': {
      const headers = ['Mark', 'Name', 'Category', 'Width (m)', 'Height (m)', 'Depth (m)']
      const rows: TableRow[] = []
      for (const node of Object.values(nodes)) {
        if (node.type !== 'item') continue
        const it = node as ItemNode
        const [w, h, d] = it.asset.dimensions
        rows.push([
          shortMark(it.id),
          it.asset.name,
          it.asset.category,
          Number((w * it.scale[0]).toFixed(3)),
          Number((h * it.scale[1]).toFixed(3)),
          Number((d * it.scale[2]).toFixed(3)),
        ])
      }
      rows.sort((a, b) => String(a[1]).localeCompare(String(b[1])))
      return { headers, rows }
    }
  }
}

function tableToCsv(headers: string[], rows: TableRow[]): string {
  const escape = (v: string | number | null) => {
    const s = v == null ? '' : String(v)
    return `"${s.replace(/"/g, '""')}"`
  }
  return [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))].join('\n')
}

export function SchedulesPanel() {
  const nodes = useScene((s) => s.nodes)
  const [scheduleType, setScheduleType] = useState<ScheduleType>('doors')
  const [exporting, setExporting] = useState(false)

  const { headers, rows } = useMemo(() => buildTable(nodes, scheduleType), [nodes, scheduleType])

  const handleExportCsv = () => {
    setExporting(true)
    try {
      const csv = tableToCsv(headers, rows)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${scheduleType}-schedule.csv`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Schedules</h2>
        {rows.length > 0 && (
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors disabled:opacity-50"
            disabled={exporting}
            onClick={handleExportCsv}
            type="button"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Type selector */}
      <div className="flex gap-1 border-b border-border/60 px-4 py-2">
        {SCHEDULE_TYPES.map(({ id, label }) => (
          <button
            className={[
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              scheduleType === id
                ? 'bg-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-accent/40',
            ].join(' ')}
            key={id}
            onClick={() => setScheduleType(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <p className="text-sm text-sidebar-foreground/50">
              No {scheduleType} in scene
            </p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-background/95 backdrop-blur-sm">
              <tr className="border-b border-border/60">
                {headers.map((h) => (
                  <th
                    className="px-3 py-2 text-left font-semibold uppercase tracking-wide text-sidebar-foreground/50 text-[10px] whitespace-nowrap"
                    key={h}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  className="border-b border-border/40 odd:bg-accent/10 even:bg-transparent hover:bg-accent/20 transition-colors"
                  key={i}
                >
                  {row.map((cell, j) => (
                    <td
                      className="px-3 py-1.5 text-sidebar-foreground/80 tabular-nums"
                      key={j}
                    >
                      {cell == null ? '' : String(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t border-border/60 px-4 py-2 text-center text-[10px] text-sidebar-foreground/40">
        {rows.length} row{rows.length === 1 ? '' : 's'}
      </div>
    </div>
  )
}
