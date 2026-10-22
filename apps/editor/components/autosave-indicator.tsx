'use client'

import type { AutosaveStatus } from '@/lib/use-autosave'

interface AutosaveIndicatorProps {
  status: AutosaveStatus
  lastSavedAt: Date | null
  errorMessage: string | null
}

function minutesAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60_000)
}

export function AutosaveIndicator({ status, lastSavedAt, errorMessage }: AutosaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-pulse" />
        Saving…
      </span>
    )
  }

  if (status === 'error') {
    return (
      <span
        className="flex items-center gap-1.5 text-xs text-destructive"
        title={errorMessage ?? undefined}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Save failed
      </span>
    )
  }

  if (status === 'saved' && lastSavedAt) {
    const mins = minutesAgo(lastSavedAt)
    const label = mins < 1 ? 'Saved just now' : `Saved ${mins} min ago`
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {label}
      </span>
    )
  }

  return null
}
