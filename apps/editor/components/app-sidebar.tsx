'use client'

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
  X,
  Package,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { signOut } from '@/lib/auth-client'

type User = {
  name: string
  email: string
  plan: 'free' | 'pro' | 'team'
  role: string
}

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
}

const NAV: NavItem[] = [
  { href: '/scenes', label: 'My Scenes', icon: LayoutGrid },
  { href: '/items', label: 'My Items', icon: Package },
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

function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {isDark ? (
        <Sun className="h-4 w-4 shrink-0" />
      ) : (
        <Moon className="h-4 w-4 shrink-0" />
      )}
      {isDark ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

type SidebarContentProps = {
  user: User | null
  onClose?: () => void
}

function SidebarContent({ user, onClose }: SidebarContentProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/scenes' ? pathname === '/scenes' : pathname.startsWith(href.split('#')[0] ?? href)

  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin')

  const adminItems = visibleNav.filter((i) => i.adminOnly)
  const regularItems = visibleNav.filter((i) => !i.adminOnly)

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <a href="/" className="flex items-center gap-2.5 text-foreground hover:opacity-80">
          <AructMark className="h-5 w-5" />
          <span className="font-bold text-sm tracking-tight" style={{ letterSpacing: '-0.02em' }}>
            Aruct Editor
          </span>
        </a>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Open Editor CTA */}
      <div className="border-b border-border px-3 py-3">
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
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
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
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
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
      <div className="border-t border-border px-3 py-3 space-y-1">
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

export function AppSidebar({ user }: { user: User | null }) {
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar sticky top-0 h-screen">
      <SidebarContent user={user} />
    </aside>
  )
}

export { SidebarContent }
