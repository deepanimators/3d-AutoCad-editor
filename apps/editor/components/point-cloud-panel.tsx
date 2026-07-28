'use client'

import { type PointCloudNode, useScene } from '@aruct/core'
import { CloudSnow, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

type ColorMode = PointCloudNode['colorMode']

export function PointCloudPanel() {
  const nodes = useScene((s) => s.nodes)
  const createNode = useScene((s) => s.createNode)
  const updateNode = useScene((s) => s.updateNode)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pointClouds = Object.values(nodes).filter(
    (n): n is PointCloudNode => n.type === 'point-cloud',
  )

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/import/point-cloud', { method: 'POST', body: formData })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setUploadError(body.error ?? `Upload failed (${res.status})`)
        return
      }
      const data = (await res.json()) as { url: string; fileName: string; pointCount: number }
      const node: PointCloudNode = {
        object: 'node',
        id: `point-cloud_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}` as PointCloudNode['id'],
        type: 'point-cloud',
        parentId: null,
        visible: true,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        fileUrl: data.url,
        fileName: data.fileName,
        pointCount: data.pointCount,
        boundingBox: { min: [0, 0, 0], max: [10, 10, 3] },
        colorMode: 'elevation',
        pointSize: 0.02,
        opacity: 1,
        metadata: {},
      }
      createNode(node)
    } catch {
      setUploadError('Upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <CloudSnow className="h-4 w-4 text-sidebar-foreground/60" />
          <h2 className="text-sm font-semibold text-sidebar-foreground">Point Cloud</h2>
        </div>
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-accent/20 px-2.5 py-1 text-xs font-medium text-sidebar-foreground hover:bg-accent/40 transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Uploading…' : 'Import .laz / .e57'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".laz,.las,.e57"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleUpload(file)
            e.target.value = ''
          }}
        />
      </div>

      {uploadError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {uploadError}
        </div>
      )}

      {pointClouds.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-8 text-center">
          <p className="text-sm text-sidebar-foreground/50">
            No point clouds yet. Import a .laz or .e57 file to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
          {pointClouds.map((pc) => (
            <PointCloudCard
              key={pc.id}
              node={pc}
              onUpdate={(patch) => updateNode(pc.id, patch as Partial<PointCloudNode>)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PointCloudCard({
  node,
  onUpdate,
}: {
  node: PointCloudNode
  onUpdate: (patch: Partial<PointCloudNode>) => void
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-transparent px-3 py-2.5">
      <p className="truncate text-sm font-medium text-sidebar-foreground" title={node.fileName}>
        {node.fileName || 'Unnamed Point Cloud'}
      </p>
      {node.pointCount > 0 && (
        <p className="mt-0.5 text-xs text-sidebar-foreground/50">
          {node.pointCount.toLocaleString()} points
        </p>
      )}

      <div className="mt-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <label className="w-20 shrink-0 text-xs text-sidebar-foreground/50">Color mode</label>
          <select
            className="flex-1 rounded-md border border-border/60 bg-background px-2 py-0.5 text-xs text-sidebar-foreground outline-none focus:border-primary"
            value={node.colorMode}
            onChange={(e) => onUpdate({ colorMode: e.target.value as ColorMode })}
          >
            <option value="elevation">Elevation</option>
            <option value="intensity">Intensity</option>
            <option value="rgb">RGB</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-20 shrink-0 text-xs text-sidebar-foreground/50">
            Point size
          </label>
          <input
            type="range"
            min={0.005}
            max={0.1}
            step={0.005}
            value={node.pointSize}
            onChange={(e) => onUpdate({ pointSize: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right text-xs tabular-nums text-sidebar-foreground/50">
            {node.pointSize.toFixed(3)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="w-20 shrink-0 text-xs text-sidebar-foreground/50">Opacity</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={node.opacity}
            onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right text-xs tabular-nums text-sidebar-foreground/50">
            {Math.round(node.opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  )
}
