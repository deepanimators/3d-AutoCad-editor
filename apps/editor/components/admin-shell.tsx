'use client'

import { usePathname } from 'next/navigation'
import {
  Users,
  Shield,
  Tag,
  BarChart3,
  Layers,
  Globe,
  HardDrive,
  LayoutGrid,
  ChevronRight,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }> }

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Shield },
  { href: '/admin/roles', label: 'Roles & RBAC', icon: Users },
  { href: '/admin/plans', label: 'Plans', icon: Layers },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/audit', label: 'Audit Log', icon: BarChart3 },
  { href: '/admin/catalog', label: 'Catalog', icon: Globe },
  { href: '/admin/storage', label: 'Storage', icon: HardDrive },
  { href: '/admin/scenes', label: 'Scenes', icon: LayoutGrid },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar">
      <div className="px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-warning">
          Admin
        </p>
        <nav className="space-y-0.5">
          {NAV.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-warning-muted text-warning font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {active && <ChevronRight className="h-3 w-3 shrink-0 opacity-60" />}
              </a>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
