import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp() {
  if (getApps().length > 0) return getApp()

  const raw = process.env.FIREBASE_PRIVATE_KEY ?? ''
  const privateKey = raw.replace(/\\n/g, '\n')

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
  })
}

// Lazy getter — avoids module-level init before env vars are available in Turbopack
export function getAdminAuth() {
  return getAuth(getAdminApp())
}
