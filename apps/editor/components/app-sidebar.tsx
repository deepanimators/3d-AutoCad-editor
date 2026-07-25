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
  Box,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth-client'

type User = {
  name: string
  email: string
  plan: 'free' | 'pro' | 'team'
  role: 'user' | 'admin'
}

const PLAN_COLORS = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-700',
  team: 'bg-violet-100 text-violet-700',
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
  { href: '/pricing', label: 'Pricing', icon: Tag },
  { href: '/account', label: 'Account', icon: Settings },
  { href: '/account#billing', label: 'Billing', icon: CreditCard },
  { href: '/admin', label: 'Admin Dashboard', icon: Shield, adminOnly: true },
  { href: '/admin/audit', label: 'Audit Log', icon: BarChart3, adminOnly: true },
]

export function AppSidebar({ user }: { user: User | null }) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/scenes' ? pathname === '/scenes' : pathname.startsWith(href.split('#')[0] ?? href)

  const visibleNav = NAV.filter((item) => !item.adminOnly || user?.role === 'admin')

  return (
    <aside className="flex w-60 flex-col border-r border-border bg-background/95">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-4">
        <a href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
          <Box className="h-5 w-5" />
          <span className="font-bold text-sm tracking-tight">Aruct Editor</span>
        </a>
      </div>

      {/* Open Editor */}
      <div className="px-3 py-3 border-b border-border">
        <a
          href="/"
          className="flex items-center justify-between rounded-lg bg-foreground px-3 py-2 text-background text-sm font-medium hover:opacity-90"
        >
          <span>Open Editor</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {visibleNav.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          const isAdminItem = item.adminOnly

          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-accent text-foreground font-medium'
                  : isAdminItem
                    ? 'text-orange-600 hover:bg-orange-50'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </a>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-border px-3 py-3">
        {user ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{user.name}</p>
                <p className="truncate text-muted-foreground text-[11px]">{user.email}</p>
              </div>
              <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${PLAN_COLORS[user.plan as keyof typeof PLAN_COLORS] ?? ''}`}>
                {PLAN_LABELS[user.plan]}
              </span>
            </div>
            {user.plan === 'free' && (
              <a
                href="/pricing"
                className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-background text-xs font-semibold hover:opacity-90"
              >
                <Tag className="h-3.5 w-3.5" />
                Upgrade to Pro
              </a>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-destructive text-sm hover:bg-destructive/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : (
          <a
            href="/login"
            className="block w-full rounded-lg bg-foreground px-3 py-2 text-center text-background text-sm font-medium hover:opacity-90"
          >
            Sign in
          </a>
        )}
      </div>
    </aside>
  )
}
