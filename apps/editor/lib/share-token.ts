import { createHmac } from 'node:crypto'

const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

function getSecret(): string {
  return process.env.SHARE_TOKEN_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? 'dev-share-secret'
}

function b64url(buf: Buffer | string): string {
  const s = typeof buf === 'string' ? buf : buf.toString('base64')
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export function generateShareToken(sceneId: string, ttlSeconds = DEFAULT_TTL_SECONDS): string {
  const expiry = Math.floor(Date.now() / 1000) + ttlSeconds
  const payload = `${sceneId}:${expiry}`
  const hmac = createHmac('sha256', getSecret()).update(payload).digest('base64')
  return `${b64url(payload)}:${b64url(hmac)}`
}

export function verifyShareToken(token: string, sceneId: string): boolean {
  try {
    const lastColon = token.lastIndexOf(':')
    if (lastColon === -1) return false
    const payload = Buffer.from(token.slice(0, lastColon), 'base64url').toString()
    const sig = token.slice(lastColon + 1)
    const [payloadSceneId, expiryStr] = payload.split(':')
    if (payloadSceneId !== sceneId) return false
    const expiry = Number(expiryStr)
    if (!Number.isFinite(expiry) || Date.now() / 1000 > expiry) return false
    const expected = b64url(createHmac('sha256', getSecret()).update(payload).digest('base64'))
    return sig === expected
  } catch {
    return false
  }
}
