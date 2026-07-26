'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { signUpWithEmail, signInWithGoogle, signInWithGitHub } from '@/lib/auth-client'

function AructMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2 L22 7.5 L12 13 L2 7.5 Z" />
      <line x1="2" y1="13" x2="22" y2="13" />
      <path d="M2 7.5 L2 16.5 L12 22 L12 13" />
      <path d="M22 7.5 L22 16.5 L12 22" />
    </svg>
  )
}

function BlueprintGrid() {
  return (
    <svg
      className="absolute inset-0 h-full w-full opacity-[0.07]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="blueprint-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
        <pattern id="blueprint-grid-major" width="200" height="200" patternUnits="userSpaceOnUse">
          <path d="M 200 0 L 0 0 0 200" fill="none" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#blueprint-grid)" />
      <rect width="100%" height="100%" fill="url(#blueprint-grid-major)" />
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifyPrompt, setVerifyPrompt] = useState(false)

  function friendlyError(code: string): string {
    if (code.includes('email-already-in-use')) return 'An account with this email already exists.'
    if (code.includes('weak-password')) return 'Password must be at least 6 characters.'
    if (code.includes('invalid-email')) return 'Invalid email address.'
    if (code.includes('network')) return 'Network error. Check your connection.'
    return 'Something went wrong. Try again.'
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUpWithEmail(email, password)
      setVerifyPrompt(true)
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ''
      setError(friendlyError(code))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      router.push('/scenes')
    } catch {
      setError('Google sign-in failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGitHub() {
    setError('')
    setLoading(true)
    try {
      await signInWithGitHub()
      router.push('/scenes')
    } catch {
      setError('GitHub sign-in failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verifyPrompt) {
    return (
      <div className="flex min-h-screen bg-background">
        {/* Left brand panel — hidden on mobile */}
        <div className="relative hidden md:flex md:w-2/5 flex-col items-center justify-center bg-brand p-12 overflow-hidden">
          <BlueprintGrid />
          <div className="relative z-10 text-center">
            <div className="mb-6 flex justify-center">
              <AructMark className="h-14 w-14 text-white/90" />
            </div>
            <h1 className="font-bold text-3xl text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
              Aruct Editor
            </h1>
            <p className="mt-3 text-white/70 text-base">
              Build in three dimensions.
            </p>
          </div>
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/40 text-xs">The precision tool for spatial design</p>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm text-center">
            <div className="mb-4 text-4xl">📬</div>
            <h2 className="font-bold text-xl">Check your email</h2>
            <p className="mt-2 text-muted-foreground text-sm">
              We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <a className="mt-6 block text-sm font-medium text-brand hover:underline underline-offset-4" href="/login">
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left brand panel — hidden on mobile */}
      <div className="relative hidden md:flex md:w-2/5 flex-col items-center justify-center bg-brand p-12 overflow-hidden">
        <BlueprintGrid />
        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <AructMark className="h-14 w-14 text-white/90" />
          </div>
          <h1 className="font-bold text-3xl text-white tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Aruct Editor
          </h1>
          <p className="mt-3 text-white/70 text-base">
            Build in three dimensions.
          </p>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/40 text-xs">The precision tool for spatial design</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex flex-col items-center md:hidden">
            <AructMark className="h-10 w-10 text-brand mb-3" />
            <h1 className="font-bold text-2xl text-foreground tracking-tight">Create account</h1>
            <p className="mt-1 text-muted-foreground text-sm">Start building in 3D for free</p>
          </div>

          {/* Desktop heading */}
          <div className="mb-8 hidden md:block">
            <h1 className="font-bold text-2xl text-foreground tracking-tight">Create account</h1>
            <p className="mt-1 text-muted-foreground text-sm">Start building in 3D for free</p>
          </div>

          <div className="space-y-3">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              disabled={loading}
              onClick={handleGoogle}
              type="button"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
              disabled={loading}
              onClick={handleGitHub}
              type="button"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-muted-foreground text-xs">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4" onSubmit={handleEmail}>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
              <input
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Password</label>
              <input
                autoComplete="new-password"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                id="password"
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                type="password"
                value={password}
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <button
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              disabled={loading}
              type="submit"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-muted-foreground text-xs">
            By creating an account you agree to our{' '}
            <a className="underline hover:text-foreground" href="/terms">Terms</a>{' '}
            and{' '}
            <a className="underline hover:text-foreground" href="/privacy">Privacy Policy</a>.
          </p>

          <p className="mt-4 text-center text-muted-foreground text-sm">
            Already have an account?{' '}
            <a className="font-medium text-brand hover:underline underline-offset-4" href="/login">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
