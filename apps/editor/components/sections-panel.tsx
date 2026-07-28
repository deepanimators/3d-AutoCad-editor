'use client'

import { type SectionNode, useScene } from '@aruct/core'
import { useViewer } from '@aruct/viewer'
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react'

const ORIENTATION_PRESETS: { label: string; normal: [number, number, number] }[] = [
  { label: 'Front', normal: [0, 0, 1] },
  { label: 'Back', normal: [0, 0, -1] },
  { label: 'Left', normal: [-1, 0, 0] },
  { label: 'Right', normal: [1, 0, 0] },
]

export function SectionsPanel() {
  const nodes = useScene((s) => s.nodes)
  const createNode = useScene((s) => s.createNode)
  const updateNode = useScene((s) => s.updateNode)
  const deleteNode = useScene((s) => s.deleteNode)

  const sectionViewPlaneId = useViewer((s) => s.sectionViewPlaneId)
  const setSectionViewPlaneId = useViewer((s) => s.setSectionViewPlaneId)
  const setCameraMode = useViewer((s) => s.setCameraMode)

  const sections = Object.values(nodes).filter(
    (n): n is SectionNode => n.type === 'section',
  )

  const handleAddSection = () => {
    const count = sections.length + 1
    const label = `Section ${String.fromCharCode(64 + count)}`
    const node = {
      id: `section_${crypto.randomUUID()}`,
      type: 'section' as const,
      parentId: null,
      visible: true,
      planePosition: [0, 2, 0] as [number, number, number],
      planeNormal: [0, 0, 1] as [number, number, number],
      width: 20,
      height: 6,
      label,
      showInSheet: false,
    }
    createNode(node as SectionNode)
  }

  const handleLookThrough = (id: string) => {
    setSectionViewPlaneId(id)
    setCameraMode('orthographic')
  }

  const handleExit = () => {
    setSectionViewPlaneId(null)
    setCameraMode('perspective')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Sections</h2>
        <button
          type="button"
          onClick={handleAddSection}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Section
        </button>
      </div>

      {sectionViewPlaneId && (
        <div className="flex items-center justify-between border-b border-border/60 bg-accent/20 px-4 py-2">
          <span className="text-xs text-sidebar-foreground/70">Section view active</span>
          <button
            type="button"
            onClick={handleExit}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Exit
          </button>
        </div>
      )}

      {sections.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No sections yet. Add a section to clip the 3D view.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 p-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`rounded-xl border px-3 py-2.5 transition-colors ${
                sectionViewPlaneId === section.id
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border/60 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  className="min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-sm font-medium text-sidebar-foreground outline-none ring-1 ring-transparent focus:ring-border"
                  value={section.label}
                  onChange={(e) =>
                    updateNode(section.id, { label: e.target.value } as Partial<SectionNode>)
                  }
                />
                <button
                  type="button"
                  title={sectionViewPlaneId === section.id ? 'Exit section view' : 'Look through section'}
                  onClick={() =>
                    sectionViewPlaneId === section.id ? handleExit() : handleLookThrough(section.id)
                  }
                  className={`rounded-md p-1 transition-colors ${
                    sectionViewPlaneId === section.id
                      ? 'text-primary hover:bg-primary/10'
                      : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-accent/40'
                  }`}
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  title="Delete section"
                  onClick={() => {
                    if (sectionViewPlaneId === section.id) handleExit()
                    deleteNode(section.id)
                  }}
                  className="rounded-md p-1 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs text-sidebar-foreground/50">Cut Y (m)</span>
                <input
                  type="number"
                  className="w-20 rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
                  value={section.planePosition[1]}
                  step={0.1}
                  onChange={(e) => {
                    const y = parseFloat(e.target.value)
                    if (!isFinite(y)) return
                    updateNode(section.id, {
                      planePosition: [section.planePosition[0], y, section.planePosition[2]],
                    } as Partial<SectionNode>)
                  }}
                />
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                {ORIENTATION_PRESETS.map((preset) => {
                  const active =
                    section.planeNormal[0] === preset.normal[0] &&
                    section.planeNormal[1] === preset.normal[1] &&
                    section.planeNormal[2] === preset.normal[2]
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() =>
                        updateNode(section.id, { planeNormal: preset.normal } as Partial<SectionNode>)
                      }
                      className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                        active
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border/60 text-sidebar-foreground/70 hover:bg-accent/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
