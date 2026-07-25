export async function GET() {
  const raw = process.env.FIREBASE_PRIVATE_KEY ?? ''
  const fixed = raw.replace(/\\n/g, '\n')

  // Test key with node:crypto
  let cryptoOk = false
  let cryptoErr = ''
  try {
    const { createPrivateKey } = await import('node:crypto')
    createPrivateKey(fixed)
    cryptoOk = true
  } catch (e) {
    cryptoErr = String(e)
  }

  // Test with firebase-admin directly
  let adminOk = false
  let adminErr = ''
  try {
    const { cert, initializeApp, getApps, deleteApp } = await import('firebase-admin/app')
    const { getAuth } = await import('firebase-admin/auth')
    const existingApps = getApps()
    const testAppName = '__debug_test__'
    const existing = existingApps.find((a) => a.name === testAppName)
    if (existing) await deleteApp(existing)
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: fixed,
      }),
    }, testAppName)
    await getAuth(app).listUsers(1)
    await deleteApp(app)
    adminOk = true
  } catch (e) {
    adminErr = String(e)
  }

  return Response.json({
    rawLength: raw.length,
    fixedLength: fixed.length,
    fixedFirst50: fixed.slice(0, 50),
    cryptoOk,
    cryptoErr,
    adminOk,
    adminErr,
  })
}
