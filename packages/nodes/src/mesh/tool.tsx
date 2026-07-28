'use client'

import {
  collectAlignmentAnchors,
  emitter,
  type GridEvent,
  MeshNode as MeshNodeSchema,
  useScene,
} from '@aruct/core'
import {
  CursorSphere,
  getFloorStackPreviewPosition,
  isAlignmentGuideActive,
  isGridSnapActive,
  isMagneticSnapActive,
  movementSfxStepKey,
  triggerSFX,
  useAlignmentGuides,
  useEditor,
} from '@aruct/editor'
import { useViewer } from '@aruct/viewer'
import { useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import {
  getLevelLocalSnappedPosition,
  resolveAlignedFloorPlacement,
} from '../shared/floor-placement'

const PRIMITIVE_COLORS: Record<string, string> = {
  box: '#f59e0b',
  sphere: '#6366f1',
  cylinder: '#10b981',
}

const MeshTool = () => {
  const activeLevelId = useViewer((state) => state.selection.levelId)
  const cursorRef = useRef<Group>(null)
  const previousSnapRef = useRef<string | null>(null)
  const primitiveType = useEditor((state) => state.selectedMeshPrimitive)

  const previewNode = useMemo(
    () =>
      MeshNodeSchema.parse({
        id: 'mesh_preview' as never,
        type: 'mesh',
        primitiveType,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    if (!activeLevelId) return
    previousSnapRef.current = null
    const lastCursorRef: { current: [number, number, number] | null } = { current: null }
    let alignmentCandidates = collectAlignmentAnchors(useScene.getState().nodes, previewNode.id)

    const onGridMove = (event: GridEvent) => {
      const { position, guides } = resolveAlignedFloorPlacement({
        node: previewNode,
        rawX: event.localPosition[0],
        rawZ: event.localPosition[2],
        gridStep: useEditor.getState().gridSnapStep,
        candidates: alignmentCandidates,
        showAlignment: isAlignmentGuideActive(),
        applyAlignmentSnap: isMagneticSnapActive(),
        bypassGrid: !isGridSnapActive(),
      })
      useAlignmentGuides.getState().set(guides)

      const visualPosition = getFloorStackPreviewPosition({
        node: previewNode,
        position,
        rotation: 0,
        levelId: activeLevelId,
      })
      cursorRef.current?.position.set(...visualPosition)
      lastCursorRef.current = position

      const nextSnapKey = movementSfxStepKey({
        coords: [position[0], position[2]],
        gridSnapActive: isGridSnapActive(),
        gridStep: useEditor.getState().gridSnapStep,
      })
      if (previousSnapRef.current !== nextSnapKey) {
        triggerSFX('sfx:grid-snap')
        previousSnapRef.current = nextSnapKey
      }
    }

    const onGridClick = (event: GridEvent) => {
      const position =
        lastCursorRef.current ??
        getLevelLocalSnappedPosition(
          activeLevelId,
          event,
          useEditor.getState().gridSnapStep,
          !isGridSnapActive(),
        )

      const primitive = useEditor.getState().selectedMeshPrimitive
      const node = MeshNodeSchema.parse({
        type: 'mesh',
        parentId: activeLevelId,
        primitiveType: primitive,
        position,
        rotation: [0, 0, 0],
      })

      useScene.getState().createNode(node, activeLevelId)
      useViewer.getState().setSelection({ selectedIds: [node.id] })
      triggerSFX('sfx:item-place')
      alignmentCandidates = collectAlignmentAnchors(useScene.getState().nodes, previewNode.id)
      useAlignmentGuides.getState().clear()
      useEditor.getState().setTool(null)
      useEditor.getState().setMode('select')
    }

    emitter.on('grid:move', onGridMove)
    emitter.on('grid:click', onGridClick)

    return () => {
      emitter.off('grid:move', onGridMove)
      emitter.off('grid:click', onGridClick)
      useAlignmentGuides.getState().clear()
    }
  }, [activeLevelId, previewNode])

  if (!activeLevelId) return null

  return <CursorSphere color={PRIMITIVE_COLORS[primitiveType] ?? '#6366f1'} height={1} ref={cursorRef} />
}

export default MeshTool
