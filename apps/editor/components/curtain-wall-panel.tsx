'use client'

import { type CurtainWallNode, useScene } from '@aruct/core'
import { Building2, Plus, Trash2 } from 'lucide-react'

const PANEL_TYPE_LABELS: Record<CurtainWallNode['panelType'], string> = {
  glazing: 'Glazing',
  spandrel: 'Spandrel',
  opaque: 'Opaque',
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-sidebar-foreground/60">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="w-20 rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
          value={value}
          min={min}
          max={max}
          step={step ?? 0.1}
          onChange={(e) => {
            const v = parseFloat(e.target.value)
            if (isFinite(v)) onChange(v)
          }}
        />
        {unit && <span className="text-xs text-sidebar-foreground/40">{unit}</span>}
      </div>
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-28 shrink-0 text-xs text-sidebar-foreground/60">{label}</span>
      <input
        type="color"
        className="h-6 w-10 cursor-pointer rounded border border-border/60 bg-background p-0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="text-xs text-sidebar-foreground/40">{value}</span>
    </div>
  )
}

function CurtainWallCard({ node }: { node: CurtainWallNode }) {
  const updateNode = useScene((s) => s.updateNode)
  const deleteNode = useScene((s) => s.deleteNode)

  function patch(data: Partial<CurtainWallNode>) {
    updateNode(node.id, data as Partial<CurtainWallNode>)
  }

  return (
    <div className="rounded-xl border border-border/60 bg-transparent p-3">
      <div className="mb-2 flex items-center gap-2">
        <Building2 className="h-4 w-4 shrink-0 text-sidebar-foreground/50" />
        <input
          className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm font-medium text-sidebar-foreground outline-none ring-1 ring-transparent focus:ring-border"
          value={node.name ?? 'Curtain Wall'}
          onChange={(e) => patch({ name: e.target.value })}
        />
        <button
          type="button"
          title="Delete curtain wall"
          onClick={() => deleteNode(node.id)}
          className="rounded-md p-1 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        {/* Panel type */}
        <div className="flex items-center gap-2">
          <span className="w-28 shrink-0 text-xs text-sidebar-foreground/60">Panel type</span>
          <div className="flex gap-1">
            {(['glazing', 'spandrel', 'opaque'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => patch({ panelType: t })}
                className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                  node.panelType === t
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/60 text-sidebar-foreground/70 hover:bg-accent/40'
                }`}
              >
                {PANEL_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <NumberField
          label="Height (m)"
          value={node.height}
          min={0.5}
          max={30}
          step={0.1}
          unit="m"
          onChange={(v) => patch({ height: v })}
        />
        <NumberField
          label="Mullion spacing"
          value={node.mullionSpacingX}
          min={0.3}
          max={6}
          step={0.05}
          unit="m"
          onChange={(v) => patch({ mullionSpacingX: v })}
        />
        <NumberField
          label="Transom spacing"
          value={node.mullionSpacingY}
          min={0.3}
          max={4}
          step={0.05}
          unit="m"
          onChange={(v) => patch({ mullionSpacingY: v })}
        />
        <NumberField
          label="Frame width"
          value={node.mullionWidth}
          min={0.02}
          max={0.2}
          step={0.005}
          unit="m"
          onChange={(v) => patch({ mullionWidth: v })}
        />
        <NumberField
          label="Frame depth"
          value={node.mullionDepth}
          min={0.02}
          max={0.3}
          step={0.005}
          unit="m"
          onChange={(v) => patch({ mullionDepth: v })}
        />
        <ColorField
          label="Frame color"
          value={node.frameColor}
          onChange={(v) => patch({ frameColor: v })}
        />
        {node.panelType === 'glazing' && (
          <>
            <ColorField
              label="Glass color"
              value={node.glazingColor}
              onChange={(v) => patch({ glazingColor: v })}
            />
            <NumberField
              label="Glass opacity"
              value={node.glazingOpacity}
              min={0.05}
              max={1}
              step={0.05}
              onChange={(v) => patch({ glazingOpacity: v })}
            />
          </>
        )}
      </div>
    </div>
  )
}

export function CurtainWallPanel() {
  const nodes = useScene((s) => s.nodes)
  const createNode = useScene((s) => s.createNode)

  const curtainWalls = Object.values(nodes).filter(
    (n): n is CurtainWallNode => n.type === 'curtain-wall',
  )

  function handleAdd() {
    const count = curtainWalls.length + 1
    const node: CurtainWallNode = {
      object: 'node',
      id: `curtain-wall_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      type: 'curtain-wall',
      name: `Curtain Wall ${count}`,
      parentId: null,
      visible: true,
      metadata: {},
      start: [0, 0],
      end: [5, 0],
      height: 3,
      mullionSpacingX: 1.5,
      mullionSpacingY: 1.0,
      mullionWidth: 0.05,
      mullionDepth: 0.1,
      panelType: 'glazing',
      frameColor: '#c0c0c0',
      glazingColor: '#88aabb',
      glazingOpacity: 0.3,
    }
    createNode(node)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Curtain Walls</h2>
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {curtainWalls.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No curtain walls yet. Add one to place a glazed facade system.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {curtainWalls.map((cw) => (
            <CurtainWallCard key={cw.id} node={cw} />
          ))}
        </div>
      )}
    </div>
  )
}
