'use client'

import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Toast) => void
  removeToast: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => set((s) => ({ toasts: [...s.toasts, toast] })),
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

function addToast(message: string, type: ToastType, duration?: number) {
  const id = Math.random().toString(36).slice(2)
  useToastStore.getState().addToast({ id, message, type, duration })
}

export function useToast() {
  const { toasts, removeToast } = useToastStore()
  return {
    toasts,
    removeToast,
    toast: (message: string, options?: { type?: ToastType; duration?: number }) =>
      addToast(message, options?.type ?? 'info', options?.duration),
    success: (message: string, duration?: number) => addToast(message, 'success', duration),
    error: (message: string, duration?: number) => addToast(message, 'error', duration),
    info: (message: string, duration?: number) => addToast(message, 'info', duration),
    warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
  }
}
