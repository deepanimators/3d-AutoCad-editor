import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth-server'
import { getStorageProvider } from '@/lib/storage'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

type EnvVar = { key: string; label: string; required: boolean; set: boolean; value?: string }

function maskSecret(val: string | undefined): string | undefined {
  if (!val) return undefined
  if (val.length <= 8) return '●'.repeat(val.length)
  return val.slice(0, 4) + '●'.repeat(Math.min(val.length - 4, 12)) + val.slice(-2)
}

export default async function AdminStoragePage() {
  const session = await getSession()
  if (!session) redirect('/login?next=/admin/storage')
  if (session.role !== 'admin') redirect('/')

  const provider = getStorageProvider()

  const s3Vars: EnvVar[] = [
    { key: 'S3_BUCKET', label: 'Bucket name', required: true, set: !!process.env.S3_BUCKET, value: process.env.S3_BUCKET },
    { key: 'S3_REGION', label: 'Region', required: false, set: !!process.env.S3_REGION, value: process.env.S3_REGION ?? 'us-east-1 (default)' },
    { key: 'AWS_ACCESS_KEY_ID', label: 'Access key ID', required: true, set: !!process.env.AWS_ACCESS_KEY_ID, value: maskSecret(process.env.AWS_ACCESS_KEY_ID) },
    { key: 'AWS_SECRET_ACCESS_KEY', label: 'Secret access key', required: true, set: !!process.env.AWS_SECRET_ACCESS_KEY, value: maskSecret(process.env.AWS_SECRET_ACCESS_KEY) },
    { key: 'S3_PUBLIC_BASE_URL', label: 'Public base URL', required: false, set: !!process.env.S3_PUBLIC_BASE_URL, value: process.env.S3_PUBLIC_BASE_URL },
  ]

  const r2Vars: EnvVar[] = [
    { key: 'R2_BUCKET', label: 'Bucket name', required: true, set: !!process.env.R2_BUCKET, value: process.env.R2_BUCKET },
    { key: 'R2_ACCOUNT_ID', label: 'Account ID', required: true, set: !!process.env.R2_ACCOUNT_ID, value: maskSecret(process.env.R2_ACCOUNT_ID) },
    { key: 'R2_ACCESS_KEY_ID', label: 'Access key ID', required: true, set: !!process.env.R2_ACCESS_KEY_ID, value: maskSecret(process.env.R2_ACCESS_KEY_ID) },
    { key: 'R2_SECRET_ACCESS_KEY', label: 'Secret access key', required: true, set: !!process.env.R2_SECRET_ACCESS_KEY, value: maskSecret(process.env.R2_SECRET_ACCESS_KEY) },
    { key: 'R2_PUBLIC_BASE_URL', label: 'Public base URL', required: true, set: !!process.env.R2_PUBLIC_BASE_URL, value: process.env.R2_PUBLIC_BASE_URL },
  ]

  const firebaseVars: EnvVar[] = [
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', label: 'Storage bucket', required: true, set: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
    { key: 'FIREBASE_PROJECT_ID', label: 'Project ID', required: true, set: !!process.env.FIREBASE_PROJECT_ID, value: process.env.FIREBASE_PROJECT_ID },
  ]

  const sections = [
    { id: 'aws-s3', label: 'AWS S3', priority: 1, vars: s3Vars, active: provider === 'aws-s3' },
    { id: 'cloudflare-r2', label: 'Cloudflare R2', priority: 2, vars: r2Vars, active: provider === 'cloudflare-r2' },
    { id: 'firebase', label: 'Firebase Storage', priority: 3, vars: firebaseVars, active: provider === 'firebase' },
  ]

  return (
    <div className="px-8 py-8 space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground">Storage Configuration</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Active provider: <strong>{provider === 'none' ? 'None (not configured)' : provider}</strong>.
          Priority order: S3 → R2 → Firebase.
        </p>
      </div>

      {provider === 'none' && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning-muted p-4 text-sm">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-warning">No storage provider configured.</p>
            <p className="text-warning/80 mt-0.5">
              GLB uploads from AI generation and imports will fail. Set environment variables in Vercel for one of the providers below.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => {
          const allRequired = section.vars.filter(v => v.required).every(v => v.set)
          return (
            <div
              key={section.id}
              className={`rounded-xl border p-6 space-y-4 ${
                section.active
                  ? 'border-success/30 bg-success-muted/30'
                  : allRequired
                  ? 'border-border bg-background'
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {section.active ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h2 className="font-semibold text-base">{section.label}</h2>
                </div>
                {section.active && (
                  <span className="rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[11px] font-semibold text-success">
                    Active
                  </span>
                )}
                <span className="text-muted-foreground text-xs ml-auto">Priority {section.priority}</span>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/30">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Variable</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Label</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Value</th>
                      <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {section.vars.map((v) => (
                      <tr key={v.key} className="hover:bg-muted/20">
                        <td className="px-4 py-2.5 font-mono text-xs text-foreground">{v.key}</td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{v.label}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                          {v.set ? (v.value ?? '(set)') : <span className="text-muted-foreground/40">not set</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          {v.set ? (
                            <span className="text-success text-xs font-medium">✓ Set</span>
                          ) : v.required ? (
                            <span className="text-destructive text-xs font-medium">✗ Required</span>
                          ) : (
                            <span className="text-muted-foreground text-xs">Optional</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border bg-muted/20 p-5">
        <p className="font-semibold text-sm mb-2">How to configure</p>
        <ol className="space-y-1.5 text-sm text-muted-foreground list-decimal pl-4">
          <li>Go to your <strong>Vercel project → Settings → Environment Variables</strong></li>
          <li>Add the variables for your chosen provider (S3, R2, or Firebase)</li>
          <li>Redeploy to apply. Storage activates automatically — no code changes needed.</li>
        </ol>
      </div>
    </div>
  )
}
