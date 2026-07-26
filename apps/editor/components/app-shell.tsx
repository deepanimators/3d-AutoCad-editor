import { getSession } from '@/lib/auth-server'
import { TopBar } from './top-bar'

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
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-[1280px] w-full px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
