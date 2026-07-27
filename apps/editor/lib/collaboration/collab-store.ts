'use client'

import { create } from 'zustand'
import type { CollabSession, CollabStatus, CollabUser } from './types'

type CollabState = {
  status: CollabStatus
  room: CollabSession | null
  localUser: CollabUser | null
}

type CollabActions = {
  setStatus: (status: CollabStatus) => void
  joinRoom: (roomId: string, user: CollabUser) => void
  leaveRoom: () => void
  updatePresence: (userId: string, data: Partial<CollabUser>) => void
  setUsers: (users: CollabUser[]) => void
}

export const useCollabStore = create<CollabState & CollabActions>((set) => ({
  status: 'disconnected',
  room: null,
  localUser: null,

  setStatus: (status) => set({ status }),

  joinRoom: (roomId, user) =>
    set({
      room: { roomId, users: [user], isConnected: true },
      localUser: user,
      status: 'connected',
    }),

  leaveRoom: () =>
    set({ room: null, localUser: null, status: 'disconnected' }),

  updatePresence: (userId, data) =>
    set((state) => {
      if (!state.room) return state
      return {
        room: {
          ...state.room,
          users: state.room.users.map((u) =>
            u.id === userId ? { ...u, ...data } : u
          ),
        },
      }
    }),

  setUsers: (users) =>
    set((state) => {
      if (!state.room) return state
      return { room: { ...state.room, users } }
    }),
}))
