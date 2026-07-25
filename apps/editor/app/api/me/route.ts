import { getSession } from '@/lib/auth-server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ user: null })

  return Response.json({
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      image: session.image,
      plan: session.plan,
      role: session.role,
      subscriptionStatus: session.subscriptionStatus,
    },
  })
}
