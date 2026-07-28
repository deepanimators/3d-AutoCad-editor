'use client'

import { sceneRegistry } from '@aruct/core'
import { useState } from 'react'

export function GlbExportPanel() {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)
    try {
      const THREE = await import('three')
      const group = new THREE.Group()
      group.name = 'AructScene'

      for (const obj of sceneRegistry.nodes.values()) {
        group.add(obj.clone())
      }

      if (group.children.length === 0) {
        setError('No geometry in scene — add some elements first.')
        return
      }

      const { exportSceneAsGLB } = await import('@/lib/export/glb-exporter')
      const blob = await exportSceneAsGLB(group)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scene.glb'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-semibold text-sidebar-foreground">GLB Export</h2>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <p className="text-xs text-sidebar-foreground/70">
          Download your scene as a GLB file for Blender, AR/VR engines, or any 3D tool that accepts glTF 2.0.
        </p>

        <div className="rounded-xl border border-border/60 p-3 flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-sidebar-foreground/50">
            What&apos;s included
          </h3>
          <ul className="text-xs text-sidebar-foreground/70 flex flex-col gap-1 list-disc list-inside">
            <li>All visible scene geometry</li>
            <li>Materials and vertex colors</li>
            <li>Node transforms and hierarchy</li>
          </ul>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <button
          type="button"
          disabled={exporting}
          onClick={() => void handleExport()}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-3 py-2 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exporting ? 'Exporting…' : 'Export GLB'}
        </button>

        <p className="text-center text-xs text-sidebar-foreground/40">
          Export runs entirely in the browser — no upload required.
        </p>
      </div>
    </div>
  )
}
