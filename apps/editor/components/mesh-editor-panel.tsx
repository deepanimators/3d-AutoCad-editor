'use client'

import { type MeshNode, useScene } from '@aruct/core'
import { Box, ChevronDown, Circle, Cylinder, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

type PrimitiveType = 'box' | 'sphere' | 'cylinder'

const PRIMITIVE_OPTIONS: { type: PrimitiveType; label: string; icon: React.ReactNode }[] = [
  { type: 'box', label: 'Box', icon: <Box className="h-4 w-4" /> },
  { type: 'sphere', label: 'Sphere', icon: <Circle className="h-4 w-4" /> },
  { type: 'cylinder', label: 'Cylinder', icon: <Cylinder className="h-4 w-4" /> },
]

export function MeshEditorPanel() {
  const nodes = useScene((s) => s.nodes)
  const createNode = useScene((s) => s.createNode)
  const deleteNode = useScene((s) => s.deleteNode)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const meshNodes = Object.values(nodes).filter(
    (n): n is MeshNode => n.type === 'mesh',
  )

  const handleAddMesh = (primitiveType: PrimitiveType) => {
    setDropdownOpen(false)
    const node: MeshNode = {
      object: 'node',
      id: `mesh_${crypto.randomUUID()}` as MeshNode['id'],
      type: 'mesh',
      parentId: null,
      visible: true,
      metadata: {},
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      positions: [],
      normals: [],
      uvs: [],
      indices: [],
      primitiveType,
    }
    createNode(node)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">Mesh Editor</h2>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Mesh
            <ChevronDown className="h-3 w-3" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-lg border border-border/60 bg-background shadow-md">
              {PRIMITIVE_OPTIONS.map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => handleAddMesh(opt.type)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground hover:bg-accent/40 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {meshNodes.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No mesh nodes yet. Add a primitive to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 p-3">
          {meshNodes.map((mesh) => {
            const vertexCount = mesh.positions.length / 3
            const faceCount = mesh.indices.length > 0 ? mesh.indices.length / 3 : 0
            const label = mesh.name ?? mesh.primitiveType.charAt(0).toUpperCase() + mesh.primitiveType.slice(1)
            return (
              <div
                key={mesh.id}
                className="rounded-xl border border-border/60 px-3 py-2.5"
              >
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
        <p className="mb-2 text-xs font-semibold text-sidebar-foreground/70">
          Editing tools (Pro — v2)
        </p>
        <ul className="space-y-1 text-xs text-sidebar-foreground/40">
          <li>Vertex / edge / face select</li>
          <li>Extrude</li>
          <li>Bevel</li>
          <li>Loop cut</li>
          <li>UV unwrap</li>
        </ul>
        <p className="mt-3 text-xs text-sidebar-foreground/40">
          v1 — geometry primitives only. Full editing in v2.
        </p>
      </div>
    </div>
  )
}
