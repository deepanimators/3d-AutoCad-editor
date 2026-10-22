'use client'

import { useEffect, useRef, useState } from 'react'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutosaveOptions {
  sceneId: string
  name: string
  version: number
  getGraph: () => unknown
  intervalMs?: number
}

interface UseAutosaveResult {
  status: AutosaveStatus
  lastSavedAt: Date | null
  errorMessage: string | null
}

export function useAutosave({
  sceneId,
  name,
  version,
  getGraph,
  intervalMs = 120_000,
}: UseAutosaveOptions): UseAutosaveResult {
  const [status, setStatus] = useState<AutosaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Track the latest version without causing the interval to re-register.
  const versionRef = useRef(version)
  useEffect(() => {
    versionRef.current = version
  }, [version])

  const nameRef = useRef(name)
  useEffect(() => {
    nameRef.current = name
  }, [name])

  const sceneIdRef = useRef(sceneId)
  useEffect(() => {
    sceneIdRef.current = sceneId
  }, [sceneId])

  // Keep a stable ref to avoid re-registering the interval when getGraph changes identity.
  const getGraphRef = useRef(getGraph)
  useEffect(() => {
    getGraphRef.current = getGraph
  }, [getGraph])

  useEffect(() => {
    async function save() {
      setStatus('saving')
      setErrorMessage(null)

      try {
        const graph = getGraphRef.current()
        const response = await fetch(`/api/scenes/${sceneIdRef.current}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'If-Match': `"${versionRef.current}"`,
          },
          body: JSON.stringify({ name: nameRef.current, graph }),
        })

        if (response.status === 409) {
          setStatus('error')
          setErrorMessage('Scene was modified elsewhere. Refresh to get the latest version.')
          return
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          setStatus('error')
          setErrorMessage((data as { error?: string }).error ?? `Save failed (${response.status})`)
          return
        }

        setStatus('saved')
        setLastSavedAt(new Date())
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Save failed')
      }
    }

    const id = setInterval(save, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { status, lastSavedAt, errorMessage }
}
