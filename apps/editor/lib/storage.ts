/**
 * Storage abstraction for GLB/thumbnail uploads.
 * Provider priority: AWS S3 → Cloudflare R2 → Firebase Storage → none
 *
 * Env vars:
 *   AWS S3:    S3_BUCKET, S3_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL (opt)
 *   R2:        R2_BUCKET, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_BASE_URL
 *   Firebase:  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (+ existing Firebase admin creds)
 */

export type StorageProvider = 'aws-s3' | 'cloudflare-r2' | 'firebase' | 'none'

export function getStorageProvider(): StorageProvider {
  if (process.env.S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    return 'aws-s3'
  }
  if (process.env.R2_BUCKET && process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
    return 'cloudflare-r2'
  }
  if (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET && process.env.FIREBASE_PROJECT_ID) {
    return 'firebase'
  }
  return 'none'
}

export function getStoragePublicUrl(key: string): string {
  if (key.startsWith('http')) return key

  const provider = getStorageProvider()

  if (provider === 'aws-s3') {
    if (process.env.S3_PUBLIC_BASE_URL) return `${process.env.S3_PUBLIC_BASE_URL}/${key}`
    const bucket = process.env.S3_BUCKET!
    const region = process.env.S3_REGION ?? 'us-east-1'
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`
  }

  if (provider === 'cloudflare-r2') {
    const base = process.env.R2_PUBLIC_BASE_URL
    if (!base) return key
    return `${base}/${key}`
  }

  if (provider === 'firebase') {
    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!
    return `https://storage.googleapis.com/${bucket}/${encodeURIComponent(key)}`
  }

  return key
}

function buildS3Client() {
  const { S3Client } = require('@aws-sdk/client-s3') as typeof import('@aws-sdk/client-s3')
  const provider = getStorageProvider()

  if (provider === 'cloudflare-r2') {
    return new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  return new S3Client({
    region: process.env.S3_REGION ?? 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const provider = getStorageProvider()

  if (provider === 'aws-s3' || provider === 'cloudflare-r2') {
    const { PutObjectCommand } = require('@aws-sdk/client-s3') as typeof import('@aws-sdk/client-s3')
    const client = buildS3Client()
    const bucket = provider === 'aws-s3' ? process.env.S3_BUCKET! : process.env.R2_BUCKET!
    await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }))
    return key
  }

  if (provider === 'firebase') {
    const { getAdminApp } = await import('./firebase/admin')
    const { getStorage } = await import('firebase-admin/storage')
    const bucket = getStorage(getAdminApp()).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
    await bucket.file(key).save(buffer, { metadata: { contentType } })
    return key
  }

  throw new Error('No storage provider configured. Set S3_BUCKET, R2_BUCKET, or FIREBASE_PROJECT_ID env vars.')
}

/** Download from a remote URL and upload to configured storage. Returns the storage key. */
export async function uploadFromUrl(sourceUrl: string, destKey: string, contentType = 'model/gltf-binary'): Promise<string> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${sourceUrl}: ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  return uploadBuffer(destKey, buffer, contentType)
}

export function storageConfigured(): boolean {
  return getStorageProvider() !== 'none'
}
