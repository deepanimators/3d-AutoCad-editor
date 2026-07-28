'use client'

import { motion, useScroll, useTransform, useInView } from 'motion/react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { ArrowRight, Check, Layers, Sparkles, Palette, Puzzle, Cloud, Download } from 'lucide-react'

// ─── Brand mark ───────────────────────────────────────────────────────────────

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

// ─── Blueprint grid ───────────────────────────────────────────────────────────

function GridBg({ className }: { className?: string }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="lp-sm" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.4" strokeOpacity="0.07" />
        </pattern>
        <pattern id="lp-lg" width="250" height="250" patternUnits="userSpaceOnUse">
          <rect width="250" height="250" fill="url(#lp-sm)" />
          <path d="M 250 0 L 0 0 0 250" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lp-lg)" />
    </svg>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const fn = () => setSolid(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? 'bg-[#06080f]/90 backdrop-blur-xl border-b border-white/[0.07]' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-[15px] text-white">
          <AructMark className="h-[18px] w-[18px] text-blue-500" />
          Aruct
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-white/50 sm:flex">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/plugins" className="hover:text-white transition-colors">Plugins</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/login" className="hidden text-[13px] text-white/50 hover:text-white transition-colors sm:block">
            Sign in
          </Link>
          <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-[7px] text-[13px] font-semibold text-white hover:bg-blue-500 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0])

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080f]">
      {/* Parallax grid */}
      <motion.div className="absolute inset-0" style={{ y: gridY }}>
        <GridBg className="h-full w-full" />
      </motion.div>

      {/* Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-blue-600/[0.12] blur-[130px]" />
      <div className="pointer-events-none absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-indigo-700/[0.08] blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#06080f] to-transparent" />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
        style={{ y: contentY, opacity }}
      >
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.09] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/80"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          The precision tool for spatial design
        </motion.div>

        <h1 className="mb-7 font-black leading-[0.93] tracking-[-0.04em]" style={{ fontSize: 'clamp(48px,9vw,96px)' }}>
          {(['Build in ', 'three', ' dimensions.'] as const).map((word, i) => (
            <motion.span
              key={i}
              className={i === 1 ? 'text-blue-500' : 'text-white'}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.28 + i * 0.13, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mx-auto mb-10 max-w-md text-white/50"
          style={{ fontSize: 17, lineHeight: 1.65 }}
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
          <Link href="/signup" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-500 transition-colors sm:w-auto">
            Create free account
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/editor" className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white transition-all backdrop-blur-sm sm:w-auto">
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
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-white/20 pt-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '3D + 2D', label: 'Dual viewports' },
  { value: '12+', label: 'Specialist plugins' },
  { value: '4', label: 'Export formats' },
  { value: 'AI', label: 'Assisted generation' },
]

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="bg-[#06080f] border-y border-white/[0.07]">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/[0.07] md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center gap-1 px-6 py-10"
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <span className="text-[28px] font-black tracking-tight text-white sm:text-[36px]">{s.value}</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/35">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Features bento ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Layers,
    title: '3D + 2D Views',
    description: 'Switch between a full perspective viewport and a top-down floorplan. Every change syncs instantly across both views.',
    accent: 'from-blue-600/15 to-indigo-600/10',
    iconBg: 'bg-blue-500/10 text-blue-400',
    wide: true,
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Design',
    description: 'Describe a room or floor plan in plain language. Aruct generates the geometry for you.',
    accent: 'from-purple-600/15 to-pink-600/10',
    iconBg: 'bg-purple-500/10 text-purple-400',
    wide: false,
  },
  {
    icon: Palette,
    title: 'PBR Material Library',
    description: 'Photorealistic physically-based materials from a curated library. Import custom textures or source from Poly Haven.',
    accent: 'from-amber-600/15 to-orange-600/10',
    iconBg: 'bg-amber-500/10 text-amber-400',
    wide: false,
  },
  {
    icon: Puzzle,
    title: 'Plugin Ecosystem',
    description: 'BOM reports, sun studies, section cuts, mesh editing, terrain, energy analysis — enable only what you need.',
    accent: 'from-emerald-600/15 to-teal-600/10',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    wide: true,
  },
  {
    icon: Cloud,
    title: 'Cloud Scenes',
    description: 'Save scenes to your account and open them from any device. Invite teammates to collaborate in real-time.',
    accent: 'from-sky-600/15 to-cyan-600/10',
    iconBg: 'bg-sky-500/10 text-sky-400',
    wide: false,
  },
  {
    icon: Download,
    title: 'Open Format Export',
    description: 'Export to GLB, STL, OBJ, or DXF. Import DWG drawings to trace and model over. Full interop with your toolchain.',
    accent: 'from-rose-600/15 to-red-600/10',
    iconBg: 'bg-rose-500/10 text-rose-400',
    wide: false,
  },
]

function FeatureCard({
  feature,
  index,
  inView,
  colSpan,
}: {
  feature: (typeof FEATURES)[0]
  index: number
  inView: boolean
  colSpan: string
}) {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0a0d1c] p-7 transition-colors hover:border-white/[0.14] ${colSpan}`}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className={`relative mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.iconBg}`}>
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className="relative mb-2 text-[15px] font-semibold text-white">{feature.title}</h3>
      <p className="relative text-[13px] leading-relaxed text-white/45">{feature.description}</p>
    </motion.div>
  )
}

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-[#06080f] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400/70">Platform</p>
          <h2 className="mb-4 font-black tracking-tight text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Everything you need to design
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-white/45">
            From concept sketch to construction documentation — Aruct covers the full workflow.
          </p>
        </motion.div>

        {/* Bento grid: 3 columns, alternating wide/narrow */}
        <div className="grid gap-3 sm:grid-cols-3">
          <FeatureCard feature={FEATURES[0]} index={0} inView={inView} colSpan="sm:col-span-2" />
          <FeatureCard feature={FEATURES[1]} index={1} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[2]} index={2} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[3]} index={3} inView={inView} colSpan="sm:col-span-2" />
          <FeatureCard feature={FEATURES[4]} index={4} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[5]} index={5} inView={inView} colSpan="sm:col-span-2" />
        </div>
      </div>
    </section>
  )
}

// ─── Plugin marquee ───────────────────────────────────────────────────────────

const PLUGINS = [
  'BOM Reports', 'Sun Study', 'Section Cuts', 'Mesh Editor', 'Terrain',
  'Energy Analysis', 'Curtain Walls', 'Point Cloud', 'Schedules', 'Collaboration',
  'Version History', 'Zone Rollup', 'DXF Export', 'Tripo AI', 'Poly Haven',
]

function PluginMarquee() {
  // Duplicate for seamless infinite loop
  const items = [...PLUGINS, ...PLUGINS]

  return (
    <section className="overflow-hidden border-y border-white/[0.07] bg-[#06080f] py-20">
      <div className="mx-auto mb-12 max-w-6xl px-6 text-center">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400/70">Ecosystem</p>
        <h2 className="mb-3 font-black tracking-tight text-white" style={{ fontSize: 'clamp(24px,3.5vw,38px)' }}>
          Extend only what you need
        </h2>
        <p className="mx-auto max-w-sm text-[15px] text-white/45">
          A focused core with specialist plugins available from the marketplace.
        </p>
      </div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-28 bg-gradient-to-r from-[#06080f] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-28 bg-gradient-to-l from-[#06080f] to-transparent" />

        <motion.div
          className="flex w-max gap-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        >
          {items.map((p, i) => (
            <span
              key={i}
              className="whitespace-nowrap rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/55"
            >
              {p}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Start with a sketch', body: 'Open the editor. Use the floorplan view to lay out rooms and spaces in 2D.' },
  { n: '02', title: 'Refine in 3D', body: 'Switch to the 3D viewport to adjust heights, add openings, apply materials.' },
  { n: '03', title: 'Enhance with plugins', body: 'Run a BOM report, a sun study, or a section cut with one-click plugins.' },
  { n: '04', title: 'Export or share', body: 'Save to your cloud account, invite teammates, or export to GLB / DXF.' },
]

function WorkflowSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="bg-[#06080f] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400/70">How it works</p>
          <h2 className="font-black tracking-tight text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Designed for how architects work
          </h2>
        </motion.div>

        {/* Grid with gap-px gives thin divider lines */}
        <div
          ref={ref}
          className="grid overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 1 }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="bg-[#06080f] p-8"
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <div className="mb-5 font-black leading-none tracking-[-0.05em] text-white/[0.07]" style={{ fontSize: 72 }}>
                {s.n}
              </div>
              <h3 className="mb-2 text-[15px] font-semibold text-white">{s.title}</h3>
              <p className="text-[13px] leading-relaxed text-white/45">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

const BULLETS = [
  'Local editor — always free',
  'Cloud saves with Pro',
  'Team collaboration with Studio',
]

function CTASection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="relative overflow-hidden bg-[#06080f] px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-blue-700/[0.09] blur-[120px]" />

      <div
        ref={ref}
        className="relative mx-auto max-w-2xl rounded-3xl border border-white/[0.08] bg-[#0a0d1c] px-10 py-14 text-center sm:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400/70">Get started</p>
          <h2 className="mb-4 font-black tracking-tight text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Free to start.<br />Scales with your team.
          </h2>
          <p className="mb-8 text-[15px] leading-relaxed text-white/45">
            Start designing with no account required. Unlock cloud saves,
            real-time collaboration, and advanced plugins with a Pro or Studio plan.
          </p>

          <ul className="mb-10 inline-flex flex-col items-start gap-3 text-left">
            {BULLETS.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-center gap-3 text-[14px] text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                  <Check className="h-3 w-3 text-blue-400" />
                </div>
                {b}
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-[14px] font-semibold text-white/65 hover:bg-white/[0.08] hover:text-white transition-all sm:w-auto"
            >
              View pricing
            </Link>
            <Link
              href="/signup"
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-500 transition-colors sm:w-auto"
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
    <footer className="border-t border-white/[0.07] bg-[#06080f] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-white">
          <AructMark className="h-[18px] w-[18px] text-blue-500" />
          Aruct
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-white/35">
          <Link href="/editor" className="hover:text-white/75 transition-colors">Editor</Link>
          <Link href="/scenes" className="hover:text-white/75 transition-colors">Scenes</Link>
          <Link href="/pricing" className="hover:text-white/75 transition-colors">Pricing</Link>
          <Link href="/plugins" className="hover:text-white/75 transition-colors">Plugins</Link>
          <Link href="/contact" className="hover:text-white/75 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-white/75 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-white/75 transition-colors">Terms</Link>
        </nav>
        <p className="text-[12px] text-white/25">© {new Date().getFullYear()} Aruct. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LandingClient() {
  return (
    <div className="bg-[#06080f] text-white antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PluginMarquee />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  )
}
