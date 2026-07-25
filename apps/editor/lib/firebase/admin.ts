import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

function getAdminApp() {
  if (getApps().length > 0) return getApp()

  const raw = process.env.FIREBASE_PRIVATE_KEY ?? ''
  // dotenv-cli may have already converted \n → real newlines; handle both cases
  const privateKey = raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw
  console.log('[firebase-admin] key_len:', privateKey.length, 'starts:', JSON.stringify(privateKey.slice(0, 40)))

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
  })
}

export const adminAuth = getAuth(getAdminApp())
