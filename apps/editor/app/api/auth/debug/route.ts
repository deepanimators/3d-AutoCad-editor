export async function GET() {
  const key = process.env.FIREBASE_PRIVATE_KEY ?? ''
  return Response.json({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL?.slice(0, 40),
    keyLength: key.length,
    keyFirst40: key.slice(0, 40),
    hasLiteralBackslashN: key.includes('\\n'),
    hasRealNewline: key.includes('\n'),
  })
}
