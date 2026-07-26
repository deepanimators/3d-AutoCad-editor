'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function InviteAcceptPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Missing invite token.')
      return
    }

    fetch('/api/orgs/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(res => res.json() as Promise<{ orgSlug?: string; error?: string }>)
      .then(data => {
        if (data.orgSlug) {
          router.replace(`/org/${data.orgSlug}`)
        } else {
          setError(data.error ?? 'Failed to accept invite.')
        }
      })
      .catch(() => setError('Network error. Please try again.'))
  }, [token, router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">{error}</p>
          <a href="/" className="text-sm underline">Go home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Accepting invite…</p>
    </div>
  )
}
