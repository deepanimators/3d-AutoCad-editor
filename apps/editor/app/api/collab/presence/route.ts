import { NextRequest, NextResponse } from 'next/server'
import type { CollabUser } from '@/lib/collaboration/types'

type PresenceEntry = {
  userId: string
  name: string
  color: string
  lastSeen: number
}

// In-memory registry: roomId -> Map<userId, PresenceEntry>
const registry = new Map<string, Map<string, PresenceEntry>>()

const STALE_MS = 30_000

function getRoom(roomId: string): Map<string, PresenceEntry> {
  let room = registry.get(roomId)
  if (!room) {
    room = new Map()
    registry.set(roomId, room)
  }
  return room
}

function evictStale(room: Map<string, PresenceEntry>): void {
  const cutoff = Date.now() - STALE_MS
  for (const [id, entry] of room) {
    if (entry.lastSeen < cutoff) room.delete(id)
  }
}

function toCollabUser(entry: PresenceEntry): CollabUser {
  return {
    id: entry.userId,
    name: entry.name,
    color: entry.color,
    lastSeen: entry.lastSeen,
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const roomId = request.nextUrl.searchParams.get('roomId')
  if (!roomId) {
    return NextResponse.json({ error: 'roomId required' }, { status: 400 })
  }

  const room = getRoom(roomId)
  evictStale(room)

  const users: CollabUser[] = Array.from(room.values()).map(toCollabUser)
  return NextResponse.json({ roomId, users })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as {
    roomId?: string
    userId?: string
    name?: string
    color?: string
  }

  const { roomId, userId, name, color } = body
  if (!roomId || !userId || !name || !color) {
    return NextResponse.json({ error: 'roomId, userId, name, color required' }, { status: 400 })
  }

  const room = getRoom(roomId)
  room.set(userId, { userId, name, color, lastSeen: Date.now() })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { roomId?: string; userId?: string }
  const { roomId, userId } = body

  if (!roomId || !userId) {
    return NextResponse.json({ error: 'roomId and userId required' }, { status: 400 })
  }

  const room = registry.get(roomId)
  if (room) room.delete(userId)
  return NextResponse.json({ ok: true })
}
