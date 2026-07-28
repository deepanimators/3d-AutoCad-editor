import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Box,
  ChevronRight,
  Cloud,
  Download,
  Layers,
  Palette,
  Puzzle,
  Sparkles,
  Sun,
} from 'lucide-react'

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

const FEATURES = [
  {
    icon: Layers,
    title: '3D + 2D Views',
    description:
      'Switch between a full perspective viewport and a top-down floorplan. Every change syncs instantly across both views.',
  },
  {
    icon: Sparkles,
    title: 'AI Generation',
    description:
      'Describe a room, floor plan, or building in plain language and watch Aruct generate the geometry for you.',
  },
  {
    icon: Palette,
    title: 'Material Library',
    description:
      'Apply photorealistic PBR materials from a curated library. Import custom textures or source from Poly Haven.',
  },
  {
    icon: Puzzle,
    title: 'Plugin Ecosystem',
    description:
      'BOM reports, sun studies, section cuts, mesh editing, terrain, energy analysis, curtain walls — enable what you need.',
  },
  {
    icon: Cloud,
    title: 'Cloud Scenes',
    description:
      'Save scenes to your account and open them from any device. Invite teammates to view or edit in real-time.',
  },
  {
    icon: Download,
    title: 'Open Formats',
    description:
      'Export to GLB, STL, OBJ, or DXF. Import DWG drawings to trace over. Full interop with your existing toolchain.',
  },
]

const PLUGINS = [
  { label: 'BOM Reports', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { label: 'Sun Study', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { label: 'Section Cuts', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { label: 'Mesh Editor', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { label: 'Terrain', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { label: 'Energy Analysis', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { label: 'Curtain Walls', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' },
  { label: 'Point Cloud', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { label: 'Schedules', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
  { label: 'Collaboration', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { label: 'Version History', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { label: 'Zone Rollup', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
]

export const metadata: Metadata = {
  title: 'Aruct — Design Buildings in Your Browser',
  description:
    'Professional 3D architectural design with AI assistance, PBR materials, a plugin ecosystem, and team collaboration. No installation required.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <AructMark className="h-5 w-5 text-primary" />
            <span className="text-lg tracking-tight">Aruct</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/scenes" className="hover:text-foreground transition-colors">
              My Scenes
            </Link>
            <Link href="/plugins" className="hover:text-foreground transition-colors">
              Plugins
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/editor"
              className="rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Open editor
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-36">
        {/* Blueprint grid background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Open-source · Browser-native · WebGPU powered
          </div>
          <h1 className="mb-5 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Design Buildings.{' '}
            <span className="text-primary">In Your Browser.</span>
          </h1>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Professional 3D architectural design with AI assistance, PBR materials, a plugin
            ecosystem, and team collaboration — no installation required.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/editor"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors sm:w-auto"
            >
              Start designing
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors sm:w-auto"
            >
              Create free account
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required · Local editor is always free
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="border-b border-border/60 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Everything you need to design
            </h2>
            <p className="text-muted-foreground">
              From concept to construction documents, Aruct has you covered.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/30 hover:bg-accent/30"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plugin ecosystem */}
      <section className="border-b border-border/60 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 px-3 py-1 text-xs font-medium text-purple-400">
                <Puzzle className="h-3.5 w-3.5" />
                Plugin ecosystem
              </div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Extend only what you need
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                Aruct ships with a core that stays lean. Enable plugins from the marketplace to add
                BOM reports, sun studies, terrain generation, energy analysis, curtain walls, and
                more — each plugin is isolated and can be toggled without affecting your workflow.
              </p>
              <Link
                href="/plugins"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Browse plugins
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {PLUGINS.map((p) => (
                <span
                  key={p.label}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${p.color}`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open source */}
      <section className="border-b border-border/60 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-border/60 bg-accent/20 px-6 py-10 text-center sm:px-12">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <Box className="h-3.5 w-3.5" />
              Open source packages
            </div>
            <h2 className="mb-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Build on top of Aruct
            </h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
              The core scene graph, viewer, editor UI, and MCP server are published as open-source
              npm packages under <code className="font-mono text-sm">@aruct/core</code>,{' '}
              <code className="font-mono text-sm">@aruct/viewer</code>, and{' '}
              <code className="font-mono text-sm">@aruct/editor</code>. Embed the viewer in your
              own app or build custom tooling on the scene graph.
            </p>
            <a
              href="https://github.com/aruct/editor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="border-b border-border/60 px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Sun className="mx-auto mb-4 h-8 w-8 text-amber-400" />
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Free to start. Scales with your work.
          </h2>
          <p className="mb-8 text-muted-foreground">
            The local editor is always free with no sign-in required. Cloud saves, collaboration,
            and advanced plugins are available on Pro and Studio plans.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-colors sm:w-auto"
            >
              View pricing
            </Link>
            <Link
              href="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors sm:w-auto"
            >
              Get started free
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <AructMark className="h-4 w-4 text-primary" />
            Aruct
          </div>
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
            <Link href="/editor" className="hover:text-foreground transition-colors">
              Editor
            </Link>
            <Link href="/scenes" className="hover:text-foreground transition-colors">
              Scenes
            </Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/plugins" className="hover:text-foreground transition-colors">
              Plugins
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </nav>
          <p className="text-xs">© {new Date().getFullYear()} Aruct. Open source.</p>
        </div>
      </footer>
    </div>
  )
}
