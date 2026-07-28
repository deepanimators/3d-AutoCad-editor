import { type NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-server'
import { canUploadCustomItems } from '@/lib/feature-gates'
import { getStoragePublicUrl, storageConfigured, uploadBuffer } from '@/lib/storage'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 16 * 1024 * 1024 // 16 MB
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canUploadCustomItems(session)) {
    return NextResponse.json({ error: 'Pro plan required to upload textures' }, { status: 403 })
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

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use PNG, JPEG, or WebP.' },
      { status: 415 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File exceeds 16 MB limit' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = EXT_MAP[file.type] ?? 'bin'
  const key = `textures/${session.id}/${crypto.randomUUID()}.${ext}`

  if (storageConfigured()) {
    await uploadBuffer(key, buffer, file.type)
    return NextResponse.json({ url: getStoragePublicUrl(key) })
  }

  // Local fallback: save under public/uploads/textures/
  const publicDir = path.join(process.cwd(), 'public', 'uploads', 'textures', session.id)
  await mkdir(publicDir, { recursive: true })
  const filename = `${crypto.randomUUID()}.${ext}`
  await writeFile(path.join(publicDir, filename), buffer)
  return NextResponse.json({ url: `/uploads/textures/${session.id}/${filename}` })
}
