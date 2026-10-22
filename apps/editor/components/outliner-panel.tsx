'use client'

import React, { useState, useMemo } from 'react'
import {
  Home,
  Layers,
  Square,
  DoorOpen,
  AppWindow,
  ArrowUpDown,
  Package,
  Hexagon,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Search,
  Columns2,
  Ruler,
  Fence,
  Grid3x3,
  Wind,
  Sun,
  Droplets,
  Scan,
  Map,
  Bookmark,
  FileText,
  Triangle,
} from 'lucide-react'
import { useScene, type AnyNode } from '@aruct/core'
import { useViewer } from '@aruct/viewer'

// ---- icon map ---------------------------------------------------------------

const NODE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  site: Map,
  building: Home,
  level: Layers,
  wall: Square,
  fence: Fence,
  door: DoorOpen,
  window: AppWindow,
  stair: ArrowUpDown,
  'stair-segment': ArrowUpDown,
  item: Package,
  zone: Hexagon,
  slab: Columns2,
  ceiling: Grid3x3,
  roof: Triangle,
  'roof-segment': Triangle,
  column: Ruler,
  elevator: ArrowUpDown,
  cabinet: Package,
  'cabinet-module': Package,
  shelf: Package,
  scan: Scan,
  guide: Bookmark,
  measurement: Ruler,
  spawn: Map,
  'box-vent': Wind,
  'ridge-vent': Wind,
  'turbine-vent': Wind,
  'cupola': Wind,
  'eyebrow-vent': Wind,
  gutter: Droplets,
  chimney: Square,
  'solar-panel': Sun,
  skylight: Sun,
  dormer: Home,
  downspout: Droplets,
  'drawing-sheet': FileText,
  'duct-segment': Wind,
  'duct-fitting': Wind,
  'duct-terminal': Wind,
  'hvac-equipment': Wind,
  lineset: Wind,
  'liquid-line': Droplets,
  'pipe-segment': Droplets,
  'pipe-fitting': Droplets,
  'pipe-trap': Droplets,
  section: FileText,
  mesh: Grid3x3,
  terrain: Map,
  'curtain-wall': Square,
  'point-cloud': Scan,
  'construction-dimension': Ruler,
  'structural-grid': Grid3x3,
}

function nodeIcon(type: string): React.ComponentType<{ className?: string }> {
  return NODE_ICONS[type] ?? Package
}

// ---- label helper -----------------------------------------------------------

function nodeLabel(node: AnyNode): string {
  const name = (node as { name?: string }).name
  if (name) return name
  return node.type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ---- visibility toggle (best-effort) ----------------------------------------
// Nodes don't have a first-class `hidden` field — we use a local override map.

// ---- node row ---------------------------------------------------------------

type NodeRowProps = {
  node: AnyNode
  depth: number
  isSelected: boolean
  isHidden: boolean
  onSelect: (id: string) => void
  onToggleVisibility: (id: string) => void
}

function NodeRow({ node, depth, isSelected, isHidden, onSelect, onToggleVisibility }: NodeRowProps) {
  const [hovered, setHovered] = useState(false)
  const Icon = nodeIcon(node.type)

  return (
    <div
      role="row"
      aria-selected={isSelected}
      className={[
        'flex items-center gap-1.5 py-0.5 pr-2 rounded cursor-pointer select-none text-xs',
        isSelected
          ? 'bg-accent text-accent-foreground font-medium'
          : hovered
          ? 'bg-muted/60 text-foreground'
          : 'text-muted-foreground',
      ].join(' ')}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon className="h-3 w-3 shrink-0 opacity-70" />
      <span className="flex-1 truncate">{nodeLabel(node)}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggleVisibility(node.id)
        }}
        className={[
          'shrink-0 rounded p-0.5 transition-opacity',
          hovered || isSelected ? 'opacity-100' : 'opacity-0 pointer-events-none',
          'hover:text-foreground',
        ].join(' ')}
        aria-label={isHidden ? 'Show node' : 'Hide node'}
      >
        {isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
      </button>
    </div>
  )
}

// ---- group row (building / level) -------------------------------------------

type GroupRowProps = {
  node: AnyNode
  depth: number
  count: number
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: (id: string) => void
}

function GroupRow({ node, depth, count, isExpanded, isSelected, onToggle, onSelect }: GroupRowProps) {
  const [hovered, setHovered] = useState(false)
  const Icon = nodeIcon(node.type)
  const Chevron = isExpanded ? ChevronDown : ChevronRight

  return (
    <div
      role="row"
      aria-selected={isSelected}
      className={[
        'flex items-center gap-1 py-0.5 pr-2 rounded cursor-pointer select-none text-xs',
        isSelected
          ? 'bg-accent text-accent-foreground font-medium'
          : hovered
          ? 'bg-muted/60 text-foreground'
          : 'text-foreground/80',
      ].join(' ')}
      style={{ paddingLeft: `${8 + depth * 12}px` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="shrink-0 rounded p-0.5 hover:bg-muted"
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
      >
        <Chevron className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className="flex flex-1 items-center gap-1.5 min-w-0"
      >
        <Icon className="h-3 w-3 shrink-0 opacity-70" />
        <span className="flex-1 truncate text-left font-medium">{nodeLabel(node)}</span>
        <span className="shrink-0 rounded-full bg-muted px-1.5 py-px text-[10px] text-muted-foreground">
          {count}
        </span>
      </button>
    </div>
  )
}

// ---- main component ---------------------------------------------------------

const GROUP_TYPES = new Set(['building', 'level', 'site'])

export function OutlinerPanel() {
  const nodes = useScene((s) => s.nodes)
  const rootNodeIds = useScene((s) => s.rootNodeIds)
  const selectedIds = useViewer((s) => s.selection.selectedIds)
  const setSelection = useViewer((s) => s.setSelection)

  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  // Local visibility overrides (id → hidden)
  const [hiddenIds, setHiddenIds] = useState<Record<string, boolean>>({})

  const query = search.trim().toLowerCase()

  // Build a flat node list for search mode
  const allNodes: AnyNode[] = useMemo(() => Object.values(nodes), [nodes])

  const filteredNodes: AnyNode[] = useMemo(() => {
    if (!query) return allNodes
    return allNodes.filter((n) => {
      const label = nodeLabel(n).toLowerCase()
      return label.includes(query) || n.type.includes(query)
    })
  }, [allNodes, query])

  function handleSelect(id: string) {
    setSelection({ selectedIds: [id] })
  }

  function handleToggleVisibility(id: string) {
    setHiddenIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function isExpanded(id: string): boolean {
    return expanded[id] !== false // default: expanded
  }

  // Recursive tree renderer
  function renderNode(node: AnyNode, depth: number): React.ReactNode {
    const isGroup = GROUP_TYPES.has(node.type)
    const childIds: string[] = (node as { children?: string[] }).children ?? []
    const childNodes = childIds.map((id) => nodes[id]).filter((n): n is AnyNode => !!n)

    if (isGroup) {
      const expanded_ = isExpanded(node.id)
      return (
        <React.Fragment key={node.id}>
          <GroupRow
            node={node}
            depth={depth}
            count={childNodes.length}
            isExpanded={expanded_}
            isSelected={selectedIds.includes(node.id)}
            onToggle={() => toggleExpand(node.id)}
            onSelect={handleSelect}
          />
          {expanded_ &&
            childNodes.map((child) => renderNode(child, depth + 1))}
        </React.Fragment>
      )
    }

    return (
      <NodeRow
        key={node.id}
        node={node}
        depth={depth}
        isSelected={selectedIds.includes(node.id)}
        isHidden={!!hiddenIds[node.id]}
        onSelect={handleSelect}
        onToggleVisibility={handleToggleVisibility}
      />
    )
  }

  const isEmpty = allNodes.length === 0

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search bar */}
      <div className="px-2 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Filter nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border bg-muted/40 pl-6 pr-2 py-1 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-1 py-1" role="treegrid" aria-label="Scene outliner">
        {isEmpty && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">
            No nodes in scene.
          </p>
        )}

        {!isEmpty && query && filteredNodes.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">
            No results for "{search}".
          </p>
        )}

        {!query &&
          rootNodeIds
            .map((id) => nodes[id])
            .filter((n): n is AnyNode => !!n)
            .map((node) => renderNode(node, 0))}

        {query &&
          filteredNodes.map((node) => (
            <NodeRow
              key={node.id}
              node={node}
              depth={0}
              isSelected={selectedIds.includes(node.id)}
              isHidden={!!hiddenIds[node.id]}
              onSelect={handleSelect}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
      </div>
    </div>
  )
}
