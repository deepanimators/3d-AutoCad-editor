'use client'

import type React from 'react'
import {
  Box,
  FileCode2,
  Eye,
  BrainCircuit,
  Link2,
  Smartphone,
  Aperture,
  Users,
  Ruler,
  CalendarDays,
  ExternalLink,
  ArrowRight,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type AppStatus = 'active' | 'beta' | 'coming-soon'

type AppDef = {
  id: string
  name: string
  tagline: string
  description: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  status: AppStatus
  href: string
  external?: boolean
  accent: string
  accentFg: string
}

const APPS: AppDef[] = [
  {
    id: 'editor',
    name: 'Aruct Editor',
    tagline: '3D architectural design',
    description: 'Full-featured 3D design environment for architects. Model spaces, place furniture, run BOM and energy analysis — all in the browser.',
    icon: Box,
    status: 'active',
    href: '/',
    accent: 'bg-violet-500/10 dark:bg-violet-500/15',
    accentFg: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'ifc-converter',
    name: 'Aruct IFC Converter',
    tagline: 'Convert IFC files',
    description: 'Import and convert Industry Foundation Classes (IFC) files into Aruct scenes. Preserve geometry, metadata, and storey structure.',
    icon: FileCode2,
    status: 'beta',
    href: '/ifc-converter',
    accent: 'bg-blue-500/10 dark:bg-blue-500/15',
    accentFg: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'viewer',
    name: 'Aruct Viewer',
    tagline: 'Embed 3D scenes anywhere',
    description: 'A zero-install embeddable 3D scene viewer. Share a link, paste an iframe — clients and stakeholders see your work without signing up.',
    icon: Eye,
    status: 'active',
    href: '/scenes',
    accent: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    accentFg: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'mcp',
    name: 'Aruct MCP',
    tagline: 'AI agent interface for architects',
    description: 'Model Context Protocol server that lets AI agents read, write, and reason about your Aruct scenes. Build AI-assisted workflows with Claude and others.',
    icon: BrainCircuit,
    status: 'active',
    href: '/api/mcp',
    accent: 'bg-amber-500/10 dark:bg-amber-500/15',
    accentFg: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'dcc-bridge',
    name: 'Aruct DCC Bridge',
    tagline: 'Connect Blender, Maya & Cinema 4D',
    description: 'Send assets from your favourite DCC tool directly into Aruct Editor. Install the addon, select objects, and they appear in My Items instantly.',
    icon: Link2,
    status: 'beta',
    href: '/dcc-bridge',
    accent: 'bg-orange-500/10 dark:bg-orange-500/15',
    accentFg: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'mobile',
    name: 'Aruct Mobile',
    tagline: 'Design on the go',
    description: 'Capture dimensions on-site, sketch layouts, and sync with your desktop project — all from your phone or tablet.',
    icon: Smartphone,
    status: 'coming-soon',
    href: '#',
    accent: 'bg-pink-500/10 dark:bg-pink-500/15',
    accentFg: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'render',
    name: 'Aruct Render',
    tagline: 'Photorealistic rendering studio',
    description: 'GPU-accelerated path-traced renders with one click. Set lighting, materials, and camera — get a production-ready image in minutes.',
    icon: Aperture,
    status: 'coming-soon',
    href: '#',
    accent: 'bg-rose-500/10 dark:bg-rose-500/15',
    accentFg: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'collaborate',
    name: 'Aruct Collaborate',
    tagline: 'Design review & markup',
    description: 'Invite clients and team members to annotate designs, leave comments on 3D elements, and track change requests — no CAD skills required.',
    icon: Users,
    status: 'coming-soon',
    href: '#',
    accent: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    accentFg: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'measure',
    name: 'Aruct Measure',
    tagline: 'Quantity takeoff & BOM',
    description: 'Automatically compute areas, volumes, and material quantities from your scene. Export a bill of materials to Excel or your procurement tool.',
    icon: Ruler,
    status: 'coming-soon',
    href: '#',
    accent: 'bg-teal-500/10 dark:bg-teal-500/15',
    accentFg: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'scheduler',
    name: 'Aruct Scheduler',
    tagline: 'Project scheduling & Gantt',
    description: 'Link your 3D model elements to project phases and generate construction schedules. Visualise time alongside space.',
    icon: CalendarDays,
    status: 'coming-soon',
    href: '#',
    accent: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    accentFg: 'text-indigo-600 dark:text-indigo-400',
  },
]

const STATUS_LABEL: Record<AppStatus, string> = {
  active: 'Active',
  beta: 'Beta',
  'coming-soon': 'Coming Soon',
}

const STATUS_STYLE: Record<AppStatus, string> = {
  active:
    'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20',
  beta:
    'bg-amber-500/10 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/20',
  'coming-soon':
    'bg-muted text-muted-foreground ring-1 ring-border',
}

function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
        STATUS_STYLE[status]
      )}
    >
      {status === 'active' && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
      )}
      {STATUS_LABEL[status]}
    </span>
  )
}

function AppCard({ app }: { app: AppDef }) {
  const Icon = app.icon
  const isComingSoon = app.status === 'coming-soon'

  const cardBase = cn(
    'group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-200',
    isComingSoon
      ? 'opacity-70'
      : 'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5 hover:border-border/80'
  )

  return (
    <div className={cardBase}>
      {/* Icon + badge row */}
      <div className="mb-4 flex items-start justify-between">
        <div
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            app.accent
          )}
        >
          <Icon className={cn('h-5 w-5', app.accentFg)} strokeWidth={1.75} />
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="font-semibold text-base text-foreground leading-snug">{app.name}</h3>
        <p className={cn('mt-0.5 text-xs font-medium', app.accentFg)}>{app.tagline}</p>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {app.description}
        </p>
      </div>

      {/* CTA */}
      <div className="mt-5">
        {isComingSoon ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm font-medium text-muted-foreground cursor-default"
            disabled
          >
            <Bell className="h-3.5 w-3.5" />
            Notify me
          </button>
        ) : app.external ? (
          <a
            href={app.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              'bg-foreground text-background hover:opacity-90'
            )}
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <a
            href={app.href}
            className={cn(
              'flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              'bg-foreground text-background hover:opacity-90'
            )}
          >
            Open
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </div>
  )
}

export function AppsClient() {
  const active = APPS.filter((a) => a.status === 'active')
  const beta = APPS.filter((a) => a.status === 'beta')
  const soon = APPS.filter((a) => a.status === 'coming-soon')

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/60 to-background px-6 py-16 text-center sm:py-20">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
            <Box className="h-3.5 w-3.5" />
            Aruct Suite
          </div>
          <h1 className="font-bold text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
            Aruct Universe
          </h1>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg max-w-xl mx-auto">
            Every tool an architect needs, in one place. Design, convert, render, collaborate — the full lifecycle of a building project.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {active.length} active
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {beta.length} in beta
            </span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              {soon.length} coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {/* Active & Beta */}
        <section>
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Available now
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...active, ...beta].map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="mt-14">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            On the roadmap
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {soon.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="mt-14 text-center text-xs text-muted-foreground">
          Want early access to upcoming tools?{' '}
          <a href="/contact" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Contact us
          </a>{' '}
          — we&apos;re building the Aruct Suite in the open.
        </p>
      </div>
    </div>
  )
}
