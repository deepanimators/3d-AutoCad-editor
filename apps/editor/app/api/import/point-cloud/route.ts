import { type NextRequest, NextResponse } from 'next/server'
import { getSession, type AppUser } from '@/lib/auth-server'
import { getStoragePublicUrl, storageConfigured, uploadBuffer } from '@/lib/storage'
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 500 * 1024 * 1024 // 500 MB
const ALLOWED_EXTENSIONS = new Set(['.laz', '.las', '.e57'])

function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase()
}

function canUploadPointCloud(user: AppUser): boolean {
  return user.role === 'admin' || (user.plan === 'team' && ['active', 'trialing', 'past_due'].includes(user.subscriptionStatus ?? ''))
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canUploadPointCloud(session)) {
    return NextResponse.json({ error: 'Team plan required to upload point clouds' }, { status: 403 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  const ext = getExtension(file.name)
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use .laz, .las, or .e57.' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 500 MB limit' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const key = `point-clouds/${session.id}/${crypto.randomUUID()}${ext}`

  if (storageConfigured()) {
    await uploadBuffer(key, buffer, 'application/octet-stream')
    return NextResponse.json({
      url: getStoragePublicUrl(key),
      fileName: file.name,
      pointCount: 0,
    })
  }

  // Local fallback: save under public/uploads/point-clouds/
  const publicDir = path.join(process.cwd(), 'public', 'uploads', 'point-clouds', session.id)
  await mkdir(publicDir, { recursive: true })
  const filename = `${crypto.randomUUID()}${ext}`
  await writeFile(path.join(publicDir, filename), buffer)
  return NextResponse.json({
    url: `/uploads/point-clouds/${session.id}/${filename}`,
    fileName: file.name,
    pointCount: 0,
  })
}
