import { getSession } from '@/lib/auth-server'
import { AppSidebar } from './app-sidebar'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        user={session ? {
          name: session.name,
          email: session.email,
          plan: session.plan,
          role: session.role,
        } : null}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
