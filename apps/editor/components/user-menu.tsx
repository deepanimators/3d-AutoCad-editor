'use client'

import { LogOut, Settings, Layers, CreditCard } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFirebaseUser } from '@/lib/use-auth'
import { signOut } from '@/lib/auth-client'

export function UserMenu() {
  const { user, loading } = useFirebaseUser()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (loading) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
  }

  if (!user) {
    return (
      <a
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent"
        href="/login"
      >
        Sign in
      </a>
    )
  }

  const initials = (user.displayName ?? user.email ?? 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ring"
        onClick={() => setOpen((o) => !o)}
        type="button"
      >
        {user.photoURL ? (
          // biome-ignore lint/performance/noImgElement: avatar
          <img alt="" className="h-8 w-8 rounded-full object-cover" src={user.photoURL} />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-medium">{user.displayName ?? 'Account'}</p>
            <p className="truncate text-muted-foreground text-xs">{user.email}</p>
          </div>
          <div className="py-1">
            <a
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              href="/scenes"
              onClick={() => setOpen(false)}
            >
              <Layers className="h-4 w-4" />
              My scenes
            </a>
            <a
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <CreditCard className="h-4 w-4" />
              Billing
            </a>
            <a
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              Account
            </a>
          </div>
          <div className="border-t border-border py-1">
            <button
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-accent"
              onClick={signOut}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
