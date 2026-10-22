import { type NextRequest, NextResponse } from 'next/server'
import * as Y from 'yjs'

export const dynamic = 'force-dynamic'

const ROOM_TTL_MS = 6 * 60 * 60 * 1000

type Room = { doc: Y.Doc; touchedAt: number }

const rooms = new Map<string, Room>()

function getRoom(roomId: string): Room {
  const now = Date.now()
  for (const [id, room] of rooms) {
    if (now - room.touchedAt > ROOM_TTL_MS) {
      room.doc.destroy()
      rooms.delete(id)
    }
  }
  let room = rooms.get(roomId)
  if (!room) {
    room = { doc: new Y.Doc(), touchedAt: now }
    rooms.set(roomId, room)
  }
  room.touchedAt = now
  return room
}

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64')
const fromBase64 = (value: string) => new Uint8Array(Buffer.from(value, 'base64'))

export async function GET(request: NextRequest) {
  const roomId = request.nextUrl.searchParams.get('roomId')
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })

  const sv = request.nextUrl.searchParams.get('sv')
  const { doc } = getRoom(roomId)
  const update = Y.encodeStateAsUpdate(doc, sv ? fromBase64(sv) : undefined)
  return NextResponse.json({ update: toBase64(update), sv: toBase64(Y.encodeStateVector(doc)) })
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    roomId?: string
    update?: string
  } | null
  if (!(body?.roomId && body.update)) {
    return NextResponse.json({ error: 'roomId and update required' }, { status: 400 })
  }

  const { doc } = getRoom(body.roomId)
  try {
    Y.applyUpdate(doc, fromBase64(body.update))
  } catch {
    return NextResponse.json({ error: 'invalid update' }, { status: 400 })
  }
  return NextResponse.json({ ok: true, sv: toBase64(Y.encodeStateVector(doc)) })
}
