'use client'

import { BarChart3, CreditCard, LayoutDashboard, LogOut, Moon, Shield, Sun, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/toolbar-tooltip'
import { signOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase/client'
import { cn } from '@/lib/utils'

type MeResponse = {
  id: string
  email: string
  name: string | null
  plan: string
  role: string
}

function RailNavButton({
  href,
  label,
  icon,
  active,
  onClick,
}: {
  href?: string
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  const inner = (
    <button
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
        active
          ? 'bg-accent text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
    </button>
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {href ? <Link href={href}>{inner}</Link> : inner}
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function RailAccountNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<MeResponse | null>(null)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d))
      .catch(() => {})
  }, [])

  const handleSignOut = useCallback(async () => {
    await signOut(firebaseAuth)
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }, [router])

  return (
    <>
      <RailNavButton
        href="/scenes"
        icon={<LayoutDashboard className="h-5 w-5" />}
        label="My Scenes"
        active={pathname === '/scenes' || pathname.startsWith('/scene/')}
      />
      <RailNavButton
        href="/account"
        icon={<User className="h-5 w-5" />}
        label="Account"
        active={pathname === '/account'}
      />
      <RailNavButton
        href="/pricing"
        icon={<CreditCard className="h-5 w-5" />}
        label="Pricing & Plans"
        active={pathname === '/pricing'}
      />
      {user?.role === 'admin' && (
        <>
          <RailNavButton
            href="/admin"
            icon={<Shield className="h-5 w-5" />}
            label="Admin"
            active={pathname === '/admin'}
          />
          <RailNavButton
            href="/admin/audit"
            icon={<BarChart3 className="h-5 w-5" />}
            label="Audit Log"
            active={pathname === '/admin/audit'}
          />
        </>
      )}
      <RailNavButton
        icon={resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        label={resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode'}
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      />
      <RailNavButton
        icon={<LogOut className="h-4 w-4" />}
        label="Sign out"
        onClick={handleSignOut}
      />
    </>
  )
}
