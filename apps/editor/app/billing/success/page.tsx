export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h1 className="font-bold text-2xl">You're all set!</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Your subscription is now active. Start building.
        </p>
        <a
          href="/editor"
          className="mt-6 inline-block rounded-lg bg-foreground px-6 py-2.5 text-background text-sm font-medium hover:opacity-90"
        >
          Open editor
        </a>
        <div className="mt-3">
          <a href="/account" className="text-muted-foreground text-sm hover:underline">
            View billing details
          </a>
        </div>
      </div>
    </div>
  )
}
