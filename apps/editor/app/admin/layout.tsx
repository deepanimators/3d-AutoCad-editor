import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { TopBar } from '@/components/top-bar'
import { AdminSidebar } from '@/components/admin-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'admin') redirect('/')

  const user = {
    name: session.name,
    email: session.email,
    plan: session.plan as 'free' | 'pro' | 'team',
    role: session.role,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
