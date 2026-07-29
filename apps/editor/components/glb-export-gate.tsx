'use client'
import { useViewer } from '@aruct/viewer'
import { useEffect, useRef } from 'react'

export function GlbExportGate() {
  const exportScene = useViewer((s) => s.exportScene)
  const gatedRef = useRef(false)

  useEffect(() => {
    if (!exportScene || gatedRef.current) return

    const original = exportScene
    gatedRef.current = true

    useViewer.setState({
      exportScene: async (format = 'glb') => {
        if (format === 'glb') {
          const res = await fetch('/api/export/glb', { method: 'POST' })
          if (!res.ok) {
            window.dispatchEvent(
              new CustomEvent('aruct:upgrade-required', {
                detail: { feature: 'glb-export', upgrade: '/pricing' },
              }),
            )
            gatedRef.current = false
            return
          }
        }
        gatedRef.current = false
        original(format)
      },
    })

    return () => {
      gatedRef.current = false
    }
  }, [exportScene])

  return null
}
