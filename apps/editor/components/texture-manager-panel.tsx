'use client'

import {
  type AnyNodeId,
  generateSceneMaterialId,
  type SceneMaterial,
  type SceneMaterialId,
  useScene,
} from '@aruct/core'
import { useViewer } from '@aruct/viewer'
import { useRef, useState } from 'react'

type UploadState = 'idle' | 'uploading' | 'error'

function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-4 w-4 shrink-0 rounded border border-border"
      style={{ background: color }}
    />
  )
}

function MaterialRow({
  mat,
  onDelete,
}: {
  mat: SceneMaterial
  onDelete: (id: SceneMaterialId) => void
}) {
  const color = mat.material.properties?.color ?? '#e9e9e9'
  const albedo = mat.maps?.albedoMap

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
      {albedo ? (
        <img alt="" className="h-6 w-6 shrink-0 rounded object-cover" src={albedo} />
      ) : (
        <ColorSwatch color={color} />
      )}
      <span className="min-w-0 flex-1 truncate font-medium">{mat.name}</span>
      <button
        aria-label={`Delete material ${mat.name}`}
        className="shrink-0 rounded px-1.5 py-0.5 text-muted-foreground text-xs hover:bg-destructive/10 hover:text-destructive"
        onClick={() => onDelete(mat.id as SceneMaterialId)}
        type="button"
      >
        Delete
      </button>
    </div>
  )
}

function AddMaterialForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#e9e9e9')
  const [albedoUrl, setAlbedoUrl] = useState('')
  const [repeatX, setRepeatX] = useState(1)
  const [repeatY, setRepeatY] = useState(1)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadState('uploading')
    setUploadError(null)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/textures/upload', { method: 'POST', body })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? `Upload failed (${res.status})`)
      }
      const { url } = (await res.json()) as { url: string }
      setAlbedoUrl(url)
      setUploadState('idle')
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
      setUploadState('error')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = () => {
    if (!name.trim()) return
    const id = generateSceneMaterialId()
    const mat: SceneMaterial = {
      id,
      name: name.trim(),
      material: {
        preset: 'custom',
        properties: { color, roughness: 0.7, metalness: 0, opacity: 1, transparent: false, side: 'front' },
        ...(albedoUrl ? { texture: { url: albedoUrl, repeat: [repeatX, repeatY] } } : {}),
      },
      ...(albedoUrl ? { maps: { albedoMap: albedoUrl } } : {}),
      ...(albedoUrl ? {
        mapProperties: {
          color,
          roughness: 0.7,
          metalness: 0,
          repeatX,
          repeatY,
          rotation: 0,
          wrapS: 'Repeat',
          wrapT: 'Repeat',
          normalScaleX: 1,
          normalScaleY: 1,
          emissiveIntensity: 1,
          displacementScale: 0.02,
          transparent: false,
          flipY: true,
          bumpScale: 1,
          emissiveColor: '#000000',
          aoMapIntensity: 1,
          side: 0,
          opacity: 1,
          lightMapIntensity: 1,
        },
      } : {}),
    }
    useScene.getState().addSceneMaterial(mat)
    setName('')
    setAlbedoUrl('')
    setColor('#e9e9e9')
    setRepeatX(1)
    setRepeatY(1)
    setUploadState('idle')
    setUploadError(null)
    onAdded()
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-3">
      <p className="font-medium text-sm">New material</p>

      <div className="space-y-1">
        <label className="text-muted-foreground text-xs" htmlFor="tm-name">Name</label>
        <input
          className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
          id="tm-name"
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Oak Parquet"
          type="text"
          value={name}
        />
      </div>

      <div className="space-y-1">
        <label className="text-muted-foreground text-xs" htmlFor="tm-color">Base color</label>
        <div className="flex items-center gap-2">
          <input
            className="h-7 w-10 cursor-pointer rounded border border-border bg-background p-0.5"
            id="tm-color"
            onChange={(e) => setColor(e.target.value)}
            type="color"
            value={color}
          />
          <span className="font-mono text-muted-foreground text-xs">{color}</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-muted-foreground text-xs">Albedo map (PNG/JPG/WebP, max 16 MB)</p>
        {albedoUrl && (
          <img alt="Albedo preview" className="h-16 w-16 rounded object-cover" src={albedoUrl} />
        )}
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            disabled={uploadState === 'uploading'}
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            {uploadState === 'uploading' ? 'Uploading…' : albedoUrl ? 'Replace' : 'Upload'}
          </button>
          {albedoUrl && (
            <button
              className="text-muted-foreground text-xs hover:text-destructive"
              onClick={() => { setAlbedoUrl(''); setUploadState('idle'); setUploadError(null) }}
              type="button"
            >
              Remove
            </button>
          )}
        </div>
        <input
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
          ref={fileInputRef}
          type="file"
        />
        {uploadError && <p className="text-destructive text-xs">{uploadError}</p>}
      </div>

      {albedoUrl && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs" htmlFor="tm-repeat-x">Repeat X</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              id="tm-repeat-x"
              min={0.01}
              onChange={(e) => setRepeatX(Number(e.target.value))}
              step={0.5}
              type="number"
              value={repeatX}
            />
          </div>
          <div className="space-y-1">
            <label className="text-muted-foreground text-xs" htmlFor="tm-repeat-y">Repeat Y</label>
            <input
              className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
              id="tm-repeat-y"
              min={0.01}
              onChange={(e) => setRepeatY(Number(e.target.value))}
              step={0.5}
              type="number"
              value={repeatY}
            />
          </div>
        </div>
      )}

      <button
        className="w-full rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground text-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!name.trim() || uploadState === 'uploading'}
        onClick={handleSave}
        type="button"
      >
        Save material
      </button>
    </div>
  )
}

export function TextureManagerPanel() {
  const materials = useScene((s) => s.materials)
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const [showForm, setShowForm] = useState(false)

  const selectedNodeId = selectedIds[0] ?? null
  const nodes = useScene((s) => s.nodes)
  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null
  const slots = selectedNode && 'slots' in selectedNode
    ? (selectedNode.slots as Record<string, string> | undefined)
    : undefined

  const handleDelete = (id: SceneMaterialId) => {
    useScene.getState().removeSceneMaterial(id)
  }

  const handleApplyToSlot = (slotKey: string, matId: string) => {
    if (!selectedNodeId) return
    useScene.getState().updateNode(selectedNodeId as AnyNodeId, {
      slots: { ...(slots ?? {}), [slotKey]: `scene:${matId}` },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  }

  const matList = Object.values(materials)

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="space-y-1">
        <h2 className="font-semibold text-sm">Texture & Material Manager</h2>
        <p className="text-muted-foreground text-xs">Upload textures and build reusable PBR materials.</p>
      </div>

      {selectedNode && slots && Object.keys(slots).length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-xs">Apply to selected node slots</p>
          {Object.entries(slots).map(([slotKey, currentRef]) => (
            <div className="flex items-center gap-2" key={slotKey}>
              <span className="w-24 shrink-0 truncate text-muted-foreground text-xs">{slotKey}</span>
              <select
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-ring"
                onChange={(e) => handleApplyToSlot(slotKey, e.target.value)}
                value={currentRef.startsWith('scene:') ? currentRef.slice(6) : ''}
              >
                <option value="">— keep current —</option>
                {matList.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="font-medium text-xs">Scene materials ({matList.length})</p>
          <button
            className="rounded-md border border-border px-2 py-0.5 text-xs hover:bg-accent"
            onClick={() => setShowForm((v) => !v)}
            type="button"
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showForm && <AddMaterialForm onAdded={() => setShowForm(false)} />}

        {matList.length === 0 && !showForm && (
          <p className="text-muted-foreground text-xs">
            No scene materials yet. Click &ldquo;+ Add&rdquo; to create one.
          </p>
        )}

        <div className="space-y-1.5">
          {matList.map((mat) => (
            <MaterialRow key={mat.id} mat={mat} onDelete={handleDelete} />
          ))}
        </div>
      </div>
    </div>
  )
}
