'use client'

import { type TerrainNode, useScene } from '@aruct/core'
import { Mountain, Plus, Trash2 } from 'lucide-react'
import { useRef } from 'react'

function parseElevationCsv(text: string, cols: number, rows: number): number[] | null {
  const lines = text.trim().split(/\r?\n/)
  const heights: number[] = []
  for (const line of lines) {
    for (const cell of line.split(',')) {
      const v = parseFloat(cell.trim())
      if (!isFinite(v)) return null
      heights.push(v)
    }
  }
  if (heights.length !== cols * rows) return null
  return heights
}

export function TerrainPanel() {
  const nodes = useScene((s) => s.nodes)
  const createNode = useScene((s) => s.createNode)
  const updateNode = useScene((s) => s.updateNode)
  const deleteNode = useScene((s) => s.deleteNode)

  const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({})

  const terrains = Object.values(nodes).filter(
    (n): n is TerrainNode => n.type === 'terrain',
  )

  const handleAdd = () => {
    const node: TerrainNode = {
      object: 'node',
      id: `terrain_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      type: 'terrain',
      parentId: null,
      visible: true,
      metadata: {},
      gridCols: 32,
      gridRows: 32,
      sizeX: 50,
      sizeZ: 50,
      heights: [],
      showContours: true,
      contourInterval: 1,
    }
    createNode(node)
  }

  const handleImportCsv = (terrain: TerrainNode, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text !== 'string') return
      const heights = parseElevationCsv(text, terrain.gridCols, terrain.gridRows)
      if (!heights) {
        alert(
          `CSV must have exactly ${terrain.gridCols * terrain.gridRows} values ` +
            `(${terrain.gridCols} cols × ${terrain.gridRows} rows).`,
        )
        return
      }
      updateNode(terrain.id as TerrainNode['id'], { heights })
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Mountain className="h-4 w-4 text-sidebar-foreground/70" />
          <h2 className="text-sm font-semibold text-sidebar-foreground">Terrain</h2>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Terrain
        </button>
      </div>

      {terrains.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No terrain nodes yet. Add a terrain to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {terrains.map((terrain) => (
            <div
              key={terrain.id}
              className="rounded-xl border border-border/60 bg-transparent px-3 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {terrain.name ?? 'Terrain'}
                </span>
                <button
                  type="button"
                  title="Delete terrain"
                  onClick={() => deleteNode(terrain.id)}
                  className="rounded-md p-1 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-sidebar-foreground/50">Grid</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      title="Columns"
                      className="w-14 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                      value={terrain.gridCols}
                      min={2}
                      max={256}
                      step={1}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (v >= 2 && v <= 256) updateNode(terrain.id, { gridCols: v })
                      }}
                    />
                    <span className="self-center text-xs text-sidebar-foreground/40">×</span>
                    <input
                      type="number"
                      title="Rows"
                      className="w-14 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                      value={terrain.gridRows}
                      min={2}
                      max={256}
                      step={1}
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10)
                        if (v >= 2 && v <= 256) updateNode(terrain.id, { gridRows: v })
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-sidebar-foreground/50">Size (m)</span>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      title="Width X"
                      className="w-14 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                      value={terrain.sizeX}
                      min={1}
                      max={1000}
                      step={1}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (isFinite(v) && v > 0) updateNode(terrain.id, { sizeX: v })
                      }}
                    />
                    <span className="self-center text-xs text-sidebar-foreground/40">×</span>
                    <input
                      type="number"
                      title="Depth Z"
                      className="w-14 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                      value={terrain.sizeZ}
                      min={1}
                      max={1000}
                      step={1}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (isFinite(v) && v > 0) updateNode(terrain.id, { sizeZ: v })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-sidebar-foreground/50">Contours</span>
                <div className="flex items-center gap-2">
                  {terrain.showContours && (
                    <input
                      type="number"
                      title="Contour interval"
                      className="w-16 rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                      value={terrain.contourInterval}
                      min={0.1}
                      max={50}
                      step={0.1}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value)
                        if (isFinite(v) && v > 0) updateNode(terrain.id, { contourInterval: v })
                      }}
                    />
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={terrain.showContours}
                    onClick={() => updateNode(terrain.id, { showContours: !terrain.showContours })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      terrain.showContours ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        terrain.showContours ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-3 border-t border-border/40 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-sidebar-foreground/50">
                    Import elevation CSV
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current[terrain.id]?.click()}
                    className="rounded-md border border-border/60 px-2 py-0.5 text-xs text-sidebar-foreground hover:bg-accent/40 transition-colors"
                  >
                    Choose file
                  </button>
                  <input
                    ref={(el) => {
                      fileInputRef.current[terrain.id] = el
                    }}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImportCsv(terrain, file)
                      e.target.value = ''
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-sidebar-foreground/40">
                  {terrain.gridCols}×{terrain.gridRows} values, comma-separated, row-per-line.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border/40 p-4">
        <p className="text-xs text-sidebar-foreground/40">
          Elevation painting coming in v2.
        </p>
      </div>
    </div>
  )
}
