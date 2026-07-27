export type CollabUser = {
  id: string
  name: string
  avatarUrl?: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: number
}

export type CollabSession = {
  roomId: string
  users: CollabUser[]
  isConnected: boolean
}

export type CollabStatus = 'disconnected' | 'connecting' | 'connected' | 'error'
