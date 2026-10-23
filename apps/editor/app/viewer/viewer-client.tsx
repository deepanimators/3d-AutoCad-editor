'use client'

import { Eye, Link2, Code2, Lock, Globe, ArrowRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const HOW_IT_WORKS = [
  {
    step: '1',
    icon: Eye,
    title: 'Open your scene',
    detail: 'Go to My Scenes and open any scene in the Aruct Editor.',
  },
  {
    step: '2',
    icon: Globe,
    title: 'Publish the scene',
    detail: 'Click Share → Publish. The scene gets a public URL accessible without login.',
  },
  {
    step: '3',
    icon: Link2,
    title: 'Share the link or embed',
    detail: 'Copy the public link or the iframe snippet and paste it anywhere.',
  },
]

const FEATURES = [
  {
    icon: Globe,
    title: 'Public link',
    description: 'Anyone with the link can orbit, zoom, and inspect your 3D scene — no account required.',
  },
  {
    icon: Code2,
    title: 'Iframe embed',
    description: 'Drop a one-line iframe into any website, Notion doc, or client portal.',
  },
  {
    icon: Lock,
    title: 'Password protection',
    description: 'Add an optional password so only invited clients can access the scene.',
  },
  {
    icon: Eye,
    title: 'View-only mode',
    description: 'Viewers can navigate but cannot edit. Your design stays safe.',
  },
]

const EXAMPLE_EMBED = `<iframe
  src="https://aruct.com/scene/demo?embed=1"
  width="100%"
  height="600"
  frameborder="0"
  allowfullscreen
></iframe>`

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function ViewerClient() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/40 px-6 py-14 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Eye className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">Aruct Viewer</h1>
          <p className="mt-3 text-base text-muted-foreground max-w-lg mx-auto">
            Share your 3D scenes as a public link or embeddable iframe. Clients and stakeholders
            experience your work in full 3D — no account, no install.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/scenes"
              className="inline-flex items-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
            >
              My Scenes
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/editor"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              Open Editor
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-14 space-y-14">
        {/* How it works */}
        <section>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.step} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                    {step.step}
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Embed snippet preview */}
        <section>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Embed snippet
          </p>
          <div className="rounded-xl border border-border bg-muted/40 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-xs text-muted-foreground font-mono">iframe</span>
              <CopyButton text={EXAMPLE_EMBED} />
            </div>
            <pre className="overflow-x-auto px-4 py-4 text-xs text-foreground font-mono leading-relaxed">
              {EXAMPLE_EMBED}
            </pre>
          </div>
        </section>

        {/* Features */}
        <section>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Viewer features
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                    <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-border bg-gradient-to-br from-emerald-500/5 to-transparent p-8 text-center">
          <h2 className="font-bold text-xl text-foreground">Ready to share?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Open a scene in My Scenes, then use the Share panel to generate your viewer link.
          </p>
          <a
            href="/scenes"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Go to My Scenes
            <ArrowRight className="h-4 w-4" />
          </a>
        </section>
      </div>
    </div>
  )
}
