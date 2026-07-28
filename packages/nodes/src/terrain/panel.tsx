'use client'

import { type AnyNode, type TerrainNode, useScene } from '@aruct/core'
import { PanelSection, PanelWrapper, SliderControl } from '@aruct/editor'
import { useViewer } from '@aruct/viewer'
import { useCallback, useRef } from 'react'

export function TerrainPanel() {
  const selectedId = useViewer((s) => s.selection.selectedIds[0])

  const node = useScene((s) =>
    selectedId ? (s.nodes[selectedId as AnyNode['id']] as TerrainNode | undefined) : undefined,
  )

  const nodeRef = useRef(node)
  nodeRef.current = node

  const handleUpdate = useCallback(
    (updates: Partial<TerrainNode>) => {
      if (!selectedId) return
      useScene.getState().updateNode(selectedId as AnyNode['id'], updates)
    },
    [selectedId],
  )

  if (!node) return null

  return (
    <PanelWrapper title="Terrain">
      <PanelSection title="Grid">
        <SliderControl
          label="Columns"
          value={node.gridCols}
          min={2}
          max={256}
          step={1}
          unit="cols"
          onChange={(v) => handleUpdate({ gridCols: Math.round(v) })}
        />
        <SliderControl
          label="Rows"
          value={node.gridRows}
          min={2}
          max={256}
          step={1}
          unit="rows"
          onChange={(v) => handleUpdate({ gridRows: Math.round(v) })}
        />
      </PanelSection>

      <PanelSection title="Size">
        <SliderControl
          label="Width (X)"
          value={node.sizeX}
          min={1}
          max={1000}
          step={1}
          unit="m"
          onChange={(v) => handleUpdate({ sizeX: v })}
        />
        <SliderControl
          label="Depth (Z)"
          value={node.sizeZ}
          min={1}
          max={1000}
          step={1}
          unit="m"
          onChange={(v) => handleUpdate({ sizeZ: v })}
        />
      </PanelSection>

      <PanelSection title="Contours">
        <div className="flex items-center justify-between px-1 py-0.5">
          <span className="text-xs text-foreground/70">Show contours</span>
          <button
            type="button"
            role="switch"
            aria-checked={node.showContours}
            onClick={() => handleUpdate({ showContours: !node.showContours })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              node.showContours ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                node.showContours ? 'translate-x-4' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {node.showContours && (
          <SliderControl
            label="Interval"
            value={node.contourInterval}
            min={0.1}
            max={50}
            step={0.1}
            unit="m"
            onChange={(v) => handleUpdate({ contourInterval: v })}
          />
        )}
      </PanelSection>

      <PanelSection title="Elevation Painting">
        <p className="px-1 py-1 text-xs text-foreground/50">
          Elevation painting coming in v2.
        </p>
      </PanelSection>
    </PanelWrapper>
  )
}

export default TerrainPanel
