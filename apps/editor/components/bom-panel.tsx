'use client'

import { computeSceneBom, useScene, type BomLineItem } from '@aruct/core'
import React from 'react'

const CATEGORY_GROUPS: { label: string; types: string[] }[] = [
  { label: 'Structural', types: ['wall', 'slab', 'ceiling', 'roof', 'stair-segment', 'fence'] },
  { label: 'Openings', types: ['door', 'window'] },
  { label: 'Furniture & Items', types: ['item'] },
]

function groupItems(items: BomLineItem[]): { label: string; rows: BomLineItem[] }[] {
  const grouped: { label: string; rows: BomLineItem[] }[] = []
  const usedTypes = new Set<string>()

  for (const group of CATEGORY_GROUPS) {
    const rows = items.filter((item) => group.types.includes(item.nodeType))
    if (rows.length > 0) {
      grouped.push({ label: group.label, rows })
      for (const row of rows) usedTypes.add(row.nodeType)
    }
  }

  const other = items.filter((item) => !usedTypes.has(item.nodeType))
  if (other.length > 0) {
    grouped.push({ label: 'Other', rows: other })
  }

  return grouped
}

function bomToCsv(items: BomLineItem[]): string {
  const header = 'Type,Label,Count,Quantity,Unit'
  const rows = items.map((item) =>
    [item.nodeType, item.label, item.count, item.quantity, item.quantityUnit]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header, ...rows].join('\n')
}

export function BomPanel() {
  const nodes = useScene((s) => s.nodes)

  const report = React.useMemo(() => computeSceneBom(nodes), [nodes])

  const handleExportCsv = () => {
    const csv = bomToCsv(report.items)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bill-of-materials.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const groups = groupItems(report.items)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Bill of Materials</h2>
        {report.items.length > 0 && (
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
          >
            Export CSV
          </button>
        )}
      </div>

      {/* Content */}
      {report.items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">No elements in scene</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 p-4">
          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                {group.label}
              </h3>
              <div className="overflow-hidden rounded-xl border border-border/60">
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border/60 bg-accent/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-foreground/50">
                  <span>Type</span>
                  <span className="text-right">Count</span>
                  <span className="min-w-[80px] text-right">Quantity</span>
                </div>
                {/* Rows */}
                {group.rows.map((item, idx) => (
                  <div
                    key={`${item.nodeType}-${item.label}-${idx}`}
                    className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 text-sm odd:bg-accent/10 even:bg-transparent"
                  >
                    <span className="truncate text-sidebar-foreground">{item.label}</span>
                    <span className="text-right tabular-nums text-sidebar-foreground/70">
                      {item.count}
                    </span>
                    <span className="min-w-[80px] text-right tabular-nums text-sidebar-foreground/70">
                      {item.quantity} <span className="text-[10px] text-sidebar-foreground/40">{item.quantityUnit}</span>
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <p className="text-center text-xs text-sidebar-foreground/40">
            {report.totalNodes} total node{report.totalNodes === 1 ? '' : 's'} in scene
          </p>
        </div>
      )}
    </div>
  )
}
