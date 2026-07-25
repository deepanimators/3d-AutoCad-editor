import { adminAuth } from '@/lib/firebase/admin'

export async function GET() {
  try {
    // Just try to list users (minimal admin op to verify credentials)
    await adminAuth.listUsers(1)
    return Response.json({ ok: true, admin: 'initialized' })
  } catch (err) {
    return Response.json({
      ok: false,
      error: String(err),
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 40),
      keyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
    })
  }
}
