'use client'

import { LogOut, Settings, Layers, CreditCard, Shield, BarChart3, Crown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFirebaseUser } from '@/lib/use-auth'
import { signOut } from '@/lib/auth-client'

type AppUser = {
  id: string
  email: string
  name: string
  image: string | null
  plan: 'free' | 'pro' | 'team'
  role: string
  subscriptionStatus: string | null
}

const PLAN_LABELS: Record<string, string> = { free: 'Free', pro: 'Pro', team: 'Team' }
const PLAN_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-700',
  team: 'bg-violet-100 text-violet-700',
}

export function UserMenu() {
  const { user, loading } = useFirebaseUser()
  const [open, setOpen] = useState(false)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/me').then((r) => r.json()).then((d) => setAppUser(d.user)).catch(() => null)
  }, [user])

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
        className="rounded-xl border border-border bg-background/90 px-3 py-1.5 text-sm font-medium shadow-2xl backdrop-blur-md hover:bg-accent"
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

  const plan = appUser?.plan ?? 'free'
  const isAdmin = appUser?.role === 'admin'

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
        <div className="absolute right-0 top-10 z-[9999] w-64 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-semibold">{user.displayName ?? appUser?.name ?? 'Account'}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PLAN_COLORS[plan]}`}>
                {PLAN_LABELS[plan]}
              </span>
            </div>
            <p className="truncate text-muted-foreground text-xs mt-0.5">{user.email}</p>
          </div>

          {/* Main nav */}
          <div className="py-1">
            <a
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent"
              href="/scenes"
              onClick={() => setOpen(false)}
            >
              <Layers className="h-4 w-4 text-muted-foreground" />
              My scenes
            </a>
            <a
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
              Account settings
            </a>
          </div>

          {/* Billing */}
          <div className="border-t border-border py-1">
            <a
              className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Billing & subscription
            </a>
            {plan === 'free' && (
              <a
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-blue-600 hover:bg-accent"
                href="/pricing"
                onClick={() => setOpen(false)}
              >
                <Crown className="h-4 w-4" />
                Upgrade to Pro
              </a>
            )}
            {plan === 'pro' && (
              <a
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-violet-600 hover:bg-accent"
                href="/pricing"
                onClick={() => setOpen(false)}
              >
                <Crown className="h-4 w-4" />
                Upgrade to Team
              </a>
            )}
          </div>

          {/* Admin section */}
          {isAdmin && (
            <div className="border-t border-border py-1">
              <a
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 hover:bg-accent"
                href="/admin"
                onClick={() => setOpen(false)}
              >
                <Shield className="h-4 w-4" />
                Admin dashboard
              </a>
              <a
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-orange-600 hover:bg-accent"
                href="/admin/audit"
                onClick={() => setOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Audit log
              </a>
            </div>
          )}

          {/* Sign out */}
          <div className="border-t border-border py-1">
            <button
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-accent"
              onClick={() => { setOpen(false); signOut() }}
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
