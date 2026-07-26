'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  LayoutGrid,
  CreditCard,
  Settings,
  Tag,
  Shield,
  BarChart3,
  LogOut,
  ChevronRight,
  Users,
  Layers,
  Sun,
  Moon,
  Menu,
  X,
  Package,
  Globe,
  Plug,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { signOut } from '@/lib/auth-client'

type User = {
  name: string
  email: string
  plan: 'free' | 'pro' | 'team'
  role: string
} | null

const PLAN_COLORS = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-brand-muted text-brand',
  team: 'bg-purple-muted text-purple',
}
const PLAN_LABELS = { free: 'Free', pro: 'Pro', team: 'Team' }

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
  teamOnly?: boolean
  drawerOnly?: boolean
}

const TOP_NAV: NavItem[] = [
  { href: '/scenes', label: 'Scenes', icon: LayoutGrid },
  { href: '/org', label: 'Team', icon: Users, teamOnly: true },
  { href: '/pricing', label: 'Pricing', icon: Tag },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
]

const DRAWER_NAV: NavItem[] = [
  { href: '/scenes', label: 'My Scenes', icon: LayoutGrid },
  { href: '/org', label: 'Team Workspaces', icon: Users, teamOnly: true },
  { href: '/items', label: 'My Items', icon: Package },
  { href: '/catalog', label: 'Model Catalog', icon: Globe },
  { href: '/dcc-bridge', label: 'DCC Bridge', icon: Plug },
  { href: '/pricing', label: 'Pricing', icon: Tag },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/account#billing', label: 'Billing', icon: CreditCard },
  { href: '/admin', label: 'Admin Dashboard', icon: Shield, adminOnly: true },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, adminOnly: true },
  { href: '/admin/roles', label: 'Roles & RBAC', icon: Users, adminOnly: true },
  { href: '/admin/plans', label: 'Plans', icon: Layers, adminOnly: true },
  { href: '/admin/audit', label: 'Audit Log', icon: BarChart3, adminOnly: true },
]

function AructMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  )
}

function ThemeToggle({ compact }: { compact?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

function DrawerContent({ user, onClose }: { user: User; onClose: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/scenes' ? pathname === '/scenes' : pathname.startsWith(href.split('#')[0] ?? href)

  const isTeamUser = user?.plan === 'team' || user?.role === 'admin'
  const visibleItems = DRAWER_NAV.filter(
    (item) =>
      (!item.adminOnly || user?.role === 'admin') &&
      (!item.teamOnly || isTeamUser),
  )
  const regularItems = visibleItems.filter((i) => !i.adminOnly)
  const adminItems = visibleItems.filter((i) => i.adminOnly)

  return (
    <>
      {/* Logo header */}
      <div className="flex h-12 items-center justify-between border-b border-border px-4 shrink-0">
        <a href="/" className="flex items-center gap-2.5 text-foreground hover:opacity-80 transition-opacity">
          <AructMark className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Aruct Editor
          </span>
        </a>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Open Editor CTA */}
      <div className="border-b border-border px-3 py-3 shrink-0">
        <a
          href="/"
          className="flex items-center justify-between rounded-lg bg-brand px-3 py-2 text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span>Open Editor</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {regularItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </a>
          )
        })}

        {adminItems.length > 0 && (
          <>
            <div className="my-2 px-3">
              <div className="h-px bg-border" />
            </div>
            <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-warning">
              Admin
            </p>
            {adminItems.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? 'bg-warning-muted text-warning font-semibold'
                      : 'text-warning hover:bg-warning-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </a>
              )
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3 space-y-1 shrink-0">
        {user ? (
          <>
            <div className="flex items-center justify-between px-2 py-1">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{user.name}</p>
                <p className="truncate text-muted-foreground text-[11px]">{user.email}</p>
              </div>
              <span
                className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {PLAN_LABELS[user.plan] ?? user.plan}
              </span>
            </div>
            {user.plan === 'free' && (
              <a
                href="/pricing"
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-brand-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Tag className="h-3.5 w-3.5" />
                Upgrade to Pro
              </a>
            )}
            <ThemeToggle />
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive text-sm hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <a
              href="/login"
              className="block w-full rounded-lg bg-brand px-3 py-2 text-center text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign in
            </a>
          </>
        )}
      </div>
    </>
  )
}

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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute left-0 top-0 h-full w-72 flex flex-col border-r border-border bg-sidebar shadow-xl">
        <DrawerContent user={user} onClose={onClose} />
      </aside>
    </div>
  )
}

export function TopBar({ user }: { user: User }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const close = useCallback(() => setDrawerOpen(false), [])

  const isActive = (href: string) =>
    href === '/scenes' ? pathname === '/scenes' : pathname.startsWith(href.split('#')[0] ?? href)

  const isTeamUser = user?.plan === 'team' || user?.role === 'admin'
  const visibleTopNav = TOP_NAV.filter(
    (item) =>
      (!item.adminOnly || user?.role === 'admin') &&
      (!item.teamOnly || isTeamUser),
  )

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center border-b border-border bg-background px-4">
        {/* Left: Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 shrink-0 text-foreground hover:opacity-80 transition-opacity"
        >
          <AructMark className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Aruct Editor
          </span>
        </a>

        {/* Center: Nav links (desktop only) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {visibleTopNav.map((item) => {
            const active = isActive(item.href)
            return (
              <a
                key={item.href}
                href={item.href}
                className={
                  active
                    ? 'rounded-md px-3 py-1.5 text-sm font-medium bg-accent text-foreground'
                    : 'rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors'
                }
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Open Editor (desktop only) */}
          <a
            href="/"
            className="hidden md:inline-flex rounded-lg bg-brand px-3 py-1.5 text-brand-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Open Editor
          </a>

          {/* Theme toggle (always visible) */}
          <ThemeToggle compact />

          {/* User name (desktop only) */}
          {user && (
            <a
              href="/account"
              className="hidden md:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <span className="max-w-[120px] truncate">{user.name}</span>
              <span
                className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {PLAN_LABELS[user.plan] ?? user.plan}
              </span>
            </a>
          )}

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      <MobileDrawer user={user} open={drawerOpen} onClose={close} />
    </>
  )
}
