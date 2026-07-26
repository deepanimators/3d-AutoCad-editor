import { getSession } from '@/lib/auth-server'
import { AppSidebar } from './app-sidebar'
import { MobileShellClient } from './mobile-shell-client'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  const user = session
    ? {
        name: session.name,
        email: session.email,
        plan: session.plan as 'free' | 'pro' | 'team',
        role: session.role,
      }
    : null

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar user={user} />
      <div className="flex flex-1 flex-col min-w-0">
        <MobileShellClient user={user} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-[1280px] w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
