'use client'

import { type MeshNode, useScene } from '@aruct/core'
import { useEditor } from '@aruct/editor'
import { Box, Circle, Cylinder, MousePointerClick, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PrimitiveType = 'box' | 'sphere' | 'cylinder'

const PRIMITIVE_OPTIONS: { type: PrimitiveType; label: string; icon: React.ReactNode }[] = [
  { type: 'box', label: 'Box', icon: <Box className="h-4 w-4" /> },
  { type: 'sphere', label: 'Sphere', icon: <Circle className="h-4 w-4" /> },
  { type: 'cylinder', label: 'Cylinder', icon: <Cylinder className="h-4 w-4" /> },
]

export function MeshEditorPanel() {
  const nodes = useScene((s) => s.nodes)
  const deleteNode = useScene((s) => s.deleteNode)

  const mode = useEditor((s) => s.mode)
  const tool = useEditor((s) => s.tool)
  const primitive = useEditor((s) => s.selectedMeshPrimitive)
  const setPrimitive = useEditor((s) => s.setSelectedMeshPrimitive)
  const setMode = useEditor((s) => s.setMode)
  const setTool = useEditor((s) => s.setTool)

  const isPlacing = mode === 'build' && tool === 'mesh'

  const meshNodes = Object.values(nodes).filter((n): n is MeshNode => n.type === 'mesh')

  const handleActivate = (type: PrimitiveType) => {
    setPrimitive(type)
    setMode('build')
    setTool('mesh')
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-sidebar-foreground/60" />
          <h2 className="text-sm font-semibold text-sidebar-foreground">Mesh Editor</h2>
        </div>
      </div>

      {/* Primitive picker */}
      <div className="border-b border-border/60 px-4 py-3">
        <p className="mb-2 text-xs font-medium text-sidebar-foreground/60">Add Primitive</p>
        <div className="flex gap-2">
          {PRIMITIVE_OPTIONS.map((opt) => {
            const isActive = primitive === opt.type
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => handleActivate(opt.type)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors',
                  isActive && isPlacing
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-400'
                    : 'border-border/60 bg-accent/10 text-sidebar-foreground hover:bg-accent/30 hover:border-border',
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Placement status */}
        {isPlacing ? (
          <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="text-xs text-amber-400">Click in the 3D viewport to place</span>
          </div>
        ) : (
          <p className="mt-2 text-xs text-sidebar-foreground/40">
            Select a primitive above, then click in the viewport to place it.
          </p>
        )}
      </div>

      {/* Mesh list */}
      {meshNodes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/40">
            No meshes yet. Pick a primitive above to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 p-3">
          {meshNodes.map((mesh) => {
            const vertexCount = mesh.positions.length / 3
            const faceCount = mesh.indices.length > 0 ? mesh.indices.length / 3 : 0
            const label =
              mesh.name ??
              mesh.primitiveType.charAt(0).toUpperCase() + mesh.primitiveType.slice(1)
            return (
              <div key={mesh.id} className="rounded-xl border border-border/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
                    {label}
                  </span>
                  <button
                    type="button"
                    title="Delete mesh"
                    onClick={() => deleteNode(mesh.id)}
                    className="rounded-md p-1 text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-sidebar-foreground/50">
                  <span>{vertexCount} verts</span>
                  {faceCount > 0 && <span>{faceCount} faces</span>}
                  <span className="capitalize">{mesh.primitiveType}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-auto border-t border-border/60 p-4">
        <p className="mb-1.5 text-xs font-semibold text-sidebar-foreground/50">
          Mesh editing tools — coming in v2
        </p>
        <ul className="space-y-0.5 text-xs text-sidebar-foreground/30">
          <li>Vertex / edge / face select</li>
          <li>Extrude, Bevel, Loop cut</li>
          <li>UV unwrap</li>
        </ul>
      </div>
    </div>
  )
}
