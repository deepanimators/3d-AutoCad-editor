'use client'

import { cn } from './../../../lib/utils'
import type { SidebarTab } from './tab-bar'

interface MobileTabBarProps {
  tabs: SidebarTab[]
  activeTab: string
  onTabPress: (id: string) => void
}

export function MobileTabBar({ tabs, activeTab, onTabPress }: MobileTabBarProps) {
  return (
    <div
      className="z-50 flex h-14 shrink-0 border-border/50 border-t bg-sidebar text-sidebar-foreground overflow-x-auto overscroll-x-contain"
      style={{
        paddingBottom: 'min(env(safe-area-inset-bottom, 0px), 34px)',
        scrollbarWidth: 'none',        // Firefox
        msOverflowStyle: 'none',       // IE/Edge legacy
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            className={cn(
              'flex shrink-0 flex-col items-center justify-center gap-0.5 text-xs transition-colors',
              'min-w-[56px] px-1',
              isActive ? 'text-foreground' : 'text-muted-foreground',
            )}
            key={tab.id}
            onClick={() => onTabPress(tab.id)}
            type="button"
          >
            {tab.mobileIcon ? (
              <span className={cn('flex h-5 w-5 items-center justify-center')}>
                {tab.mobileIcon}
              </span>
            ) : null}
            <span className="font-medium truncate max-w-[52px]">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
