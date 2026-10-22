'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToast, type Toast, type ToastType } from '@/lib/use-toast'

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="size-4 shrink-0" />,
  error: <XCircle className="size-4 shrink-0" />,
  info: <Info className="size-4 shrink-0" />,
  warning: <AlertTriangle className="size-4 shrink-0" />,
}

const COLORS: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  error:   'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  info:    'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
}

const ICON_COLORS: Record<ToastType, string> = {
  success: 'text-green-600 dark:text-green-400',
  error:   'text-red-600 dark:text-red-400',
  info:    'text-blue-600 dark:text-blue-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
}

const DEFAULT_DURATION = 4000

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const duration = toast.duration ?? DEFAULT_DURATION
    timerRef.current = setTimeout(() => onRemove(toast.id), duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md',
        'w-80 max-w-[calc(100vw-2rem)]',
        'animate-in slide-in-from-right-full duration-300',
        COLORS[toast.type],
      ].join(' ')}
      role="alert"
    >
      <span className={ICON_COLORS[toast.type]}>{ICONS[toast.type]}</span>
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  )
}
