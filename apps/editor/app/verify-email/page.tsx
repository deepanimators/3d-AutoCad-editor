import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 flex justify-center">
          <Mail className="h-12 w-12 text-brand" strokeWidth={1.5} />
        </div>
        <h1 className="font-bold text-2xl text-foreground tracking-tight">Check your email</h1>
        <p className="mt-3 text-muted-foreground">
          We sent a verification link to your inbox. Click the link to activate your account.
        </p>
        <p className="mt-4 text-muted-foreground text-sm">
          Already verified?{' '}
          <a href="/login" className="font-medium text-brand hover:underline underline-offset-4">
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
