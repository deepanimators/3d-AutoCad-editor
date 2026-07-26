'use client'

import { useState, useEffect, useCallback } from 'react'
import { Menu } from 'lucide-react'
import { SidebarContent } from './app-sidebar'

type User = {
  name: string
  email: string
  plan: 'free' | 'pro' | 'team'
  role: string
} | null

function MobileDrawer({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute left-0 top-0 h-full w-72 flex flex-col border-r border-border bg-sidebar shadow-xl">
        <SidebarContent user={user} onClose={onClose} />
      </aside>
    </div>
  )
}

export function MobileShellClient({ user }: { user: User }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const close = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background/95 backdrop-blur-sm px-4 md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex flex-1 items-center justify-center">
          <a href="/" className="flex items-center gap-2 text-foreground">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2 L22 7.5 L12 13 L2 7.5 Z" />
              <line x1="2" y1="13" x2="22" y2="13" />
              <path d="M2 7.5 L2 16.5 L12 22 L12 13" />
              <path d="M22 7.5 L22 16.5 L12 22" />
            </svg>
            <span className="font-bold text-sm" style={{ letterSpacing: '-0.02em' }}>
              Aruct Editor
            </span>
          </a>
        </div>
        <div className="w-9" />
      </header>
      <MobileDrawer user={user} open={drawerOpen} onClose={close} />
    </>
  )
}
