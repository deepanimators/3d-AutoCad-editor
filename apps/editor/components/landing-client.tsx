'use client'

import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'motion/react'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import {
  ChevronRight,
  Cloud,
  Download,
  Layers,
  Palette,
  Puzzle,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react'

// ─── Brand mark ──────────────────────────────────────────────────────────────

function AructMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 L22 7.5 L12 13 L2 7.5 Z" />
      <line x1="2" y1="13" x2="22" y2="13" />
      <path d="M2 7.5 L2 16.5 L12 22 L12 13" />
      <path d="M22 7.5 L22 16.5 L12 22" />
    </svg>
  )
}

// ─── Scroll-aware navbar ──────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'hsl(var(--background) / 0.92)' : 'transparent',
        borderBottom: scrolled ? '1px solid hsl(var(--border) / 0.6)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <AructMark className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">Aruct</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/scenes" className="hover:text-foreground transition-colors">My Scenes</Link>
          <Link href="/plugins" className="hover:text-foreground transition-colors">Plugins</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors sm:block">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-lg bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

// ─── Blueprint grid (SVG) ─────────────────────────────────────────────────────

function BlueprintGrid({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="small-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <pattern id="large-grid" width="200" height="200" patternUnits="userSpaceOnUse">
          <rect width="200" height="200" fill="url(#small-grid)" />
          <path d="M 200 0 L 0 0 0 200" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#large-grid)" />
    </svg>
  )
}

// ─── Floating 3D wireframe cube ───────────────────────────────────────────────

function WireframeCube({ progress }: { progress: number }) {
  const rotate = progress * 30
  const faces = [
    // front
    'M 100 60 L 220 60 L 220 180 L 100 180 Z',
    // back (offset)
    'M 140 20 L 260 20 L 260 140 L 140 140 Z',
    // connecting edges
    'M 100 60 L 140 20', 'M 220 60 L 260 20',
    'M 220 180 L 260 140', 'M 100 180 L 140 140',
  ]
  return (
    <svg
      viewBox="0 0 360 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-primary/30"
      style={{ transform: `rotateY(${rotate}deg)`, transformStyle: 'preserve-3d' }}
    >
      {faces.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

// ─── Hero section ─────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const cubeY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const cubeProgress = useTransform(scrollYProgress, [0, 1], [0, 1])

  const [cubeVal, setCubeVal] = useState(0)
  useEffect(() => cubeProgress.on('change', v => setCubeVal(v)), [cubeProgress])

  const words = ['Build in', 'three', 'dimensions.']

  return (
    <section ref={ref} className="relative flex h-screen min-h-[680px] items-center justify-center overflow-hidden bg-[oklch(0.10_0.02_264)]">
      {/* Animated blueprint grid */}
      <motion.div className="absolute inset-0 text-primary/10" style={{ y: gridY }}>
        <BlueprintGrid className="h-full w-full" />
      </motion.div>

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,oklch(0.55_0.22_264_/_0.25),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[oklch(0.10_0.02_264)] to-transparent" />

      {/* Floating wireframe cube */}
      <motion.div
        className="absolute right-[8%] top-1/2 hidden w-[380px] -translate-y-1/2 xl:block"
        style={{ y: cubeY, opacity }}
      >
        <WireframeCube progress={cubeVal} />
      </motion.div>

      {/* Hero text */}
      <motion.div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6" style={{ y: textY, opacity }}>
        <motion.p
          className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-primary/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The precision tool for spatial design
        </motion.p>

        <h1 className="mb-6 overflow-hidden text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
          {words.map((word, wi) => (
            <motion.span
              key={wi}
              className={`inline-block ${wi === 1 ? 'text-primary' : ''} ${wi < words.length - 1 ? 'mr-[0.2em]' : ''}`}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 + wi * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mx-auto mb-10 max-w-xl text-base text-white/50 sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          Professional 3D architectural editor for architects, designers, and space planners.
          AI-assisted, material-rich, and built for teams.
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.85 }}
        >
          <Link
            href="/signup"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all sm:w-auto"
          >
            Create free account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/editor"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all backdrop-blur sm:w-auto"
          >
            Try without signing in
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <motion.div
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="h-2 w-1 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: '3D + 2D', label: 'dual viewports' },
  { value: '12+', label: 'specialist plugins' },
  { value: '4 formats', label: 'export options' },
  { value: 'AI', label: 'assisted generation' },
]

function StatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className="border-y border-border/60 bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center gap-0.5 px-4 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <span className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{s.value}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature reveal card ──────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Layers,
    title: '3D + 2D Views',
    description: 'Switch between a full perspective viewport and a top-down floorplan. Every change syncs instantly across both views.',
    accent: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Design',
    description: 'Describe a room, floor plan, or building in plain language and let Aruct generate the geometry for you.',
    accent: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Palette,
    title: 'PBR Material Library',
    description: 'Apply photorealistic physically-based materials from a curated library. Import custom textures or source from Poly Haven.',
    accent: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Puzzle,
    title: 'Plugin Ecosystem',
    description: 'BOM reports, sun studies, section cuts, mesh editing, terrain, energy analysis — enable only what you need.',
    accent: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Cloud,
    title: 'Cloud Scenes',
    description: 'Save scenes to your account and open them from any device. Invite teammates to view or collaborate in real-time.',
    accent: 'from-sky-500/20 to-cyan-500/20',
    iconColor: 'text-sky-400',
  },
  {
    icon: Download,
    title: 'Open Format Export',
    description: 'Export to GLB, STL, OBJ, or DXF. Import DWG drawings to trace and model over. Full interop with your toolchain.',
    accent: 'from-rose-500/20 to-red-500/20',
    iconColor: 'text-rose-400',
  },
]

function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 transition-colors hover:border-primary/40"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Hover gradient bg */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />

      <div className={`relative mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-card/80 shadow-sm border border-border/60 ${feature.iconColor}`}>
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className="relative mb-2 text-sm font-semibold text-foreground">{feature.title}</h3>
      <p className="relative text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Platform</p>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Everything you need to design
          </h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            From concept sketch to construction documentation — Aruct covers the full workflow.
          </p>
        </motion.div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => <FeatureCard key={f.title} feature={f} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Plugin ecosystem strip ───────────────────────────────────────────────────

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

function PluginsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-[oklch(0.10_0.02_264)] px-4 py-20 sm:px-6 sm:py-28">
      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 text-primary/5">
        <BlueprintGrid className="h-full w-full" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,oklch(0.55_0.22_264_/_0.12),transparent)]" />

      <div ref={ref} className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                <Puzzle className="h-3.5 w-3.5" />
                Plugin ecosystem
              </div>
              <h2 className="mb-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Extend only<br />what you need
              </h2>
              <p className="mb-8 text-white/50 leading-relaxed">
                Aruct ships with a focused core. Enable plugins from the marketplace to add specialist
                tooling — each plugin is isolated and toggleable without disrupting your workflow.
              </p>
              <Link
                href="/plugins"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Browse all plugins
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {PLUGINS.map((p, i) => (
              <motion.span
                key={p.label}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium ${p.color}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              >
                {p.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Workflow steps ───────────────────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Start with a sketch', body: 'Open the editor, use the floorplan view to lay out rooms and spaces in 2D.' },
  { n: '02', title: 'Refine in 3D', body: 'Switch to the 3D viewport to adjust heights, add openings, apply materials, and see it come to life.' },
  { n: '03', title: 'Enhance with plugins', body: 'Run a BOM report, a sun study, or a section cut. Each plugin adds depth without bloating the core.' },
  { n: '04', title: 'Export or share', body: 'Save to your cloud account, invite teammates, or export to GLB / DXF for downstream tools.' },
]

function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Workflow</p>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Designed for how<br className="hidden sm:block" /> architects actually work
          </h2>
        </motion.div>

        <div ref={ref} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              {/* connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute top-4 left-[calc(100%_-_12px)] hidden h-px w-6 bg-border/60 lg:block" />
              )}
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {s.n}
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing CTA ──────────────────────────────────────────────────────────────

const PLAN_BULLETS = ['Local editor — always free', 'Cloud saves with Pro', 'Team collaboration with Studio']

function PricingCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative overflow-hidden border-t border-border/60 px-4 py-20 sm:px-6 sm:py-28">
      {/* Gradient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,oklch(0.55_0.22_264_/_0.10),transparent)]" />

      <div ref={ref} className="relative mx-auto max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Pricing</p>
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Free to start.<br />Scales with your team.
          </h2>
          <p className="mb-8 text-muted-foreground">
            Start designing with no account required. Unlock cloud saves, real-time collaboration,
            and advanced plugins with a Pro or Studio plan.
          </p>

          <ul className="mb-10 inline-flex flex-col items-start gap-2.5 text-left">
            {PLAN_BULLETS.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-center gap-2.5 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {b}
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-accent transition-colors sm:w-auto"
            >
              View pricing
            </Link>
            <Link
              href="/signup"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors sm:w-auto"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-border/60 px-4 py-10 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <AructMark className="h-4 w-4 text-primary" />
          Aruct
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/editor" className="hover:text-foreground transition-colors">Editor</Link>
          <Link href="/scenes" className="hover:text-foreground transition-colors">Scenes</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/plugins" className="hover:text-foreground transition-colors">Plugins</Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </nav>
        <p className="text-xs">© {new Date().getFullYear()} Aruct. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LandingClient() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <PluginsSection />
      <WorkflowSection />
      <PricingCTA />
      <Footer />
    </div>
  )
}
