'use client'

import { Box, Circle, Cylinder, MousePointerClick } from 'lucide-react'
import useEditor from '../../../store/use-editor'
import { cn } from '../../../lib/utils'
import { ActionButton } from './action-button'

type MeshPrimitive = 'box' | 'sphere' | 'cylinder'

const PRIMITIVES: { id: MeshPrimitive; label: string; icon: React.ReactNode; shortcut: string }[] =
  [
    { id: 'box', label: 'Box', icon: <Box className="h-4 w-4" />, shortcut: '1' },
    { id: 'sphere', label: 'Sphere', icon: <Circle className="h-4 w-4" />, shortcut: '2' },
    { id: 'cylinder', label: 'Cylinder', icon: <Cylinder className="h-4 w-4" />, shortcut: '3' },
  ]

export function MeshToolbar() {
  const activeSidebarPanel = useEditor((s) => s.activeSidebarPanel)
  const mode = useEditor((s) => s.mode)
  const tool = useEditor((s) => s.tool)
  const primitive = useEditor((s) => s.selectedMeshPrimitive)
  const setPrimitive = useEditor((s) => s.setSelectedMeshPrimitive)
  const setMode = useEditor((s) => s.setMode)
  const setTool = useEditor((s) => s.setTool)

  if (activeSidebarPanel !== 'mesh-editor') return null

  const isPlacing = mode === 'build' && tool === 'mesh'

  const handleSelectPrimitive = (id: MeshPrimitive) => {
    setPrimitive(id)
    setMode('build')
    setTool('mesh')
  }

  const handleTogglePlace = () => {
    if (isPlacing) {
      setTool(null)
      setMode('select')
    } else {
      setMode('build')
      setTool('mesh')
    }
  }

  return (
    <>
      <div className="mx-1 h-5 w-px bg-border" />
      <div className="flex items-center gap-0.5">
        {PRIMITIVES.map((p) => {
          const isActive = isPlacing && primitive === p.id
          return (
            <ActionButton
              key={p.id}
              className={cn(
                'text-muted-foreground',
                isActive
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'hover:bg-amber-500/10 hover:text-amber-400',
              )}
              label={`Mesh: ${p.label}`}
              onClick={() => handleSelectPrimitive(p.id)}
              shortcut={p.shortcut}
              size="icon"
              variant="ghost"
            >
              {p.icon}
            </ActionButton>
          )
        })}
        <ActionButton
          className={cn(
            'text-muted-foreground',
            isPlacing
              ? 'bg-amber-500/20 text-amber-400'
              : 'hover:bg-amber-500/10 hover:text-amber-400',
          )}
          label={isPlacing ? 'Placing — click viewport to place (Esc to cancel)' : 'Place mesh'}
          onClick={handleTogglePlace}
          size="icon"
          variant="ghost"
        >
          <MousePointerClick className="h-4 w-4" />
        </ActionButton>
      </div>
    </>
  )
}
