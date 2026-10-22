'use client'

import { useState } from 'react'
import { PanelLeft } from 'lucide-react'
import { OutlinerPanel } from './outliner-panel'

export function OutlinerSidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={[
        'flex flex-col border-r border-border bg-sidebar transition-all duration-200 shrink-0',
        collapsed ? 'w-8' : 'w-56',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex h-9 items-center justify-between border-b border-border px-2">
        {!collapsed && (
          <span className="text-xs font-semibold text-foreground/70 uppercase tracking-wider select-none">
            Outliner
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand outliner' : 'Collapse outliner'}
        >
          <PanelLeft className={['h-3.5 w-3.5 transition-transform', collapsed ? 'rotate-180' : ''].join(' ')} />
        </button>
      </div>

      {/* Panel body */}
      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <OutlinerPanel />
        </div>
      )}
    </aside>
  )
}
