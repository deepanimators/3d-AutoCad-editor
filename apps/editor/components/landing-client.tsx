'use client'

import Lenis from 'lenis'
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'motion/react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import {
  ArrowRight, Check,
  Layers, Sparkles, Palette, Puzzle, Cloud, Download,
  BarChart2, Sun, Scissors, Box, Mountain, Zap, ChevronRight,
} from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

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
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth="0.4" strokeOpacity="0.08" />
        </pattern>
        <pattern id="lp-lg" width="250" height="250" patternUnits="userSpaceOnUse">
          <rect width="250" height="250" fill="url(#lp-sm)" />
          <path d="M 250 0 L 0 0 0 250" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.12" />
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 dark:bg-[#06080f]/92 dark:border-white/[0.07]' : 'border-b border-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-[15px] text-slate-900 dark:text-white">
          <AructMark className="h-[18px] w-[18px] text-blue-500" />
          Aruct
        </Link>
        <nav className="hidden items-center gap-6 text-[13px] text-slate-500 dark:text-white/50 sm:flex">
          <Link href="/pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/plugins" className="hover:text-slate-900 dark:hover:text-white transition-colors">Plugins</Link>
          <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden text-[13px] text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white transition-colors sm:block">Sign in</Link>
          <Link href="/signup" className="rounded-lg bg-blue-600 px-4 py-[7px] text-[13px] font-semibold text-white hover:bg-blue-500 transition-colors">
            Get started
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Floor plan SVG (hero visual) ────────────────────────────────────────────

function FloorPlanSVG() {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Glow behind */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-blue-700/[0.14] blur-[90px]" />
      </div>
      {/* Bezel */}
      <div className="relative rounded-2xl border border-white/[0.1] bg-[#07091a] shadow-[0_0_80px_rgba(59,107,255,0.08)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-500/[0.08]" />
        <svg viewBox="0 0 440 360" className="w-full" xmlns="http://www.w3.org/2000/svg">
          {/* Grid */}
          <rect width="440" height="360" fill="#060a18" />
          <defs>
            <pattern id="fpg" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(59,107,255,0.07)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="440" height="360" fill="url(#fpg)" />

          {/* Header bar */}
          <rect width="440" height="26" fill="#0a0f24" />
          <text x="12" y="17" fill="rgba(99,140,255,0.5)" fontSize="7" fontFamily="monospace" letterSpacing="2">FLOOR PLAN — LEVEL 01</text>
          <circle cx="405" cy="13" r="3.5" fill="rgba(255,255,255,0.07)" />
          <circle cx="418" cy="13" r="3.5" fill="rgba(255,255,255,0.07)" />
          <circle cx="431" cy="13" r="3.5" fill="rgba(255,255,255,0.07)" />

          {/* ── Room fills ── */}
          <rect x="20" y="40" width="160" height="120" fill="rgba(59,107,255,0.03)" />
          <rect x="180" y="40" width="140" height="120" fill="rgba(59,107,255,0.03)" />
          <rect x="20" y="180" width="160" height="120" fill="rgba(59,107,255,0.03)" />
          <rect x="180" y="180" width="80" height="80" fill="rgba(59,107,255,0.03)" />
          <rect x="260" y="180" width="60" height="120" fill="rgba(59,107,255,0.03)" />

          {/* ── Outer boundary ── */}
          <rect x="20" y="40" width="300" height="260" fill="none" stroke="rgba(99,140,255,0.7)" strokeWidth="1.5" />

          {/* ── Internal walls ── */}
          <line x1="180" y1="40" x2="180" y2="75" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />
          <line x1="180" y1="105" x2="180" y2="300" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />
          <path d="M 180 75 A 30 30 0 0 1 150 75" fill="none" stroke="rgba(99,140,255,0.22)" strokeWidth="0.75" strokeDasharray="3,2" />
          <line x1="150" y1="75" x2="150" y2="78" stroke="rgba(99,140,255,0.4)" strokeWidth="0.75" />

          <line x1="20" y1="160" x2="100" y2="160" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />
          <line x1="130" y1="160" x2="320" y2="160" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />
          <path d="M 100 160 A 30 30 0 0 0 100 130" fill="none" stroke="rgba(99,140,255,0.22)" strokeWidth="0.75" strokeDasharray="3,2" />
          <line x1="100" y1="130" x2="103" y2="130" stroke="rgba(99,140,255,0.4)" strokeWidth="0.75" />

          <line x1="260" y1="160" x2="260" y2="260" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />
          <line x1="180" y1="260" x2="260" y2="260" stroke="rgba(99,140,255,0.65)" strokeWidth="1.5" />

          {/* ── Room labels ── */}
          <text x="100" y="101" fill="rgba(160,180,255,0.65)" fontSize="7.5" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">LIVING ROOM</text>
          <text x="100" y="113" fill="rgba(99,140,255,0.4)" fontSize="6.5" fontFamily="monospace" textAnchor="middle">5.0 × 4.0 m</text>
          <text x="250" y="101" fill="rgba(160,180,255,0.65)" fontSize="7.5" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">KITCHEN</text>
          <text x="250" y="113" fill="rgba(99,140,255,0.4)" fontSize="6.5" fontFamily="monospace" textAnchor="middle">4.5 × 4.0 m</text>
          <text x="100" y="237" fill="rgba(160,180,255,0.65)" fontSize="7.5" fontFamily="monospace" textAnchor="middle" letterSpacing="1.5">BEDROOM</text>
          <text x="100" y="249" fill="rgba(99,140,255,0.4)" fontSize="6.5" fontFamily="monospace" textAnchor="middle">4.5 × 4.5 m</text>
          <text x="220" y="203" fill="rgba(160,180,255,0.65)" fontSize="7" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">BATH</text>
          <text x="290" y="237" fill="rgba(160,180,255,0.65)" fontSize="7" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">STUDY</text>

          {/* ── Furniture ── */}
          <rect x="27" y="46" width="62" height="22" rx="3" fill="rgba(99,140,255,0.12)" stroke="rgba(99,140,255,0.3)" strokeWidth="0.75" />
          <rect x="27" y="46" width="62" height="8" rx="2" fill="rgba(99,140,255,0.2)" />
          <rect x="187" y="46" width="13" height="55" fill="rgba(99,140,255,0.15)" stroke="rgba(99,140,255,0.3)" strokeWidth="0.75" />
          <rect x="187" y="46" width="60" height="13" fill="rgba(99,140,255,0.15)" stroke="rgba(99,140,255,0.3)" strokeWidth="0.75" />
          <rect x="27" y="167" width="56" height="44" rx="2" fill="rgba(99,140,255,0.12)" stroke="rgba(99,140,255,0.3)" strokeWidth="0.75" />
          <rect x="27" y="167" width="56" height="13" rx="2" fill="rgba(99,140,255,0.2)" />
          <line x1="50" y1="180" x2="50" y2="211" stroke="rgba(99,140,255,0.18)" strokeWidth="0.5" />
          <ellipse cx="205" cy="232" rx="8" ry="10" fill="rgba(99,140,255,0.1)" stroke="rgba(99,140,255,0.3)" strokeWidth="0.75" />
          <rect x="197" y="220" width="16" height="7" rx="1" fill="rgba(99,140,255,0.15)" stroke="rgba(99,140,255,0.25)" strokeWidth="0.5" />
          <rect x="183" y="166" width="32" height="22" rx="3" fill="rgba(99,140,255,0.1)" stroke="rgba(99,140,255,0.28)" strokeWidth="0.75" />
          <ellipse cx="199" cy="177" rx="10" ry="7" fill="none" stroke="rgba(99,140,255,0.2)" strokeWidth="0.5" />
          <rect x="268" y="167" width="44" height="18" fill="rgba(99,140,255,0.12)" stroke="rgba(99,140,255,0.28)" strokeWidth="0.75" />
          <circle cx="305" cy="176" r="3" fill="none" stroke="rgba(99,140,255,0.25)" strokeWidth="0.5" />

          {/* ── Dimension lines ── */}
          <line x1="20" y1="320" x2="320" y2="320" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <line x1="20" y1="315" x2="20" y2="325" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <line x1="320" y1="315" x2="320" y2="325" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <text x="170" y="335" fill="rgba(99,140,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="middle">12.5 m</text>

          <line x1="340" y1="40" x2="340" y2="300" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <line x1="334" y1="40" x2="346" y2="40" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <line x1="334" y1="300" x2="346" y2="300" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <text x="360" y="175" fill="rgba(99,140,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="middle" transform="rotate(90 360 175)">10.8 m</text>

          {/* ── Compass ── */}
          <g transform="translate(408, 58)">
            <line x1="0" y1="-13" x2="0" y2="13" stroke="rgba(99,140,255,0.4)" strokeWidth="0.75" />
            <line x1="-13" y1="0" x2="13" y2="0" stroke="rgba(99,140,255,0.4)" strokeWidth="0.75" />
            <polygon points="0,-13 -3,-4 3,-4" fill="rgba(99,140,255,0.6)" />
            <text x="0" y="-16" fill="rgba(99,140,255,0.5)" fontSize="7" fontFamily="monospace" textAnchor="middle">N</text>
          </g>

          {/* ── Scale bar ── */}
          <line x1="365" y1="285" x2="430" y2="285" stroke="rgba(99,140,255,0.32)" strokeWidth="1.2" />
          <line x1="365" y1="281" x2="365" y2="289" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <line x1="397" y1="282" x2="397" y2="288" stroke="rgba(99,140,255,0.32)" strokeWidth="0.5" />
          <line x1="430" y1="281" x2="430" y2="289" stroke="rgba(99,140,255,0.32)" strokeWidth="0.75" />
          <text x="397" y="300" fill="rgba(99,140,255,0.38)" fontSize="6.5" fontFamily="monospace" textAnchor="middle">3.0 m</text>

          {/* ── Annotation dots ── */}
          <circle cx="100" cy="160" r="3" fill="rgba(59,107,255,0.4)" />
          <circle cx="180" cy="90" r="3" fill="rgba(59,107,255,0.4)" />
        </svg>
      </div>
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const gridY = useTransform(scrollYProgress, [0, 1], ['0%', '60%'])
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const visualY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  const CHIPS = ['2D + 3D viewports', 'AI generation', 'Plugin ecosystem', 'No download']

  return (
    <section ref={ref} className="relative flex min-h-screen items-center overflow-hidden bg-slate-50 dark:bg-[#06080f]">
      {/* Parallax grid — moves slowest */}
      <motion.div className="absolute inset-0 text-slate-900 dark:text-white" style={{ y: gridY }}>
        <GridBg className="h-full w-full" />
      </motion.div>

      {/* Parallax glow — mid layer */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ y: glowY }}>
        <div className="absolute -top-32 left-1/4 h-[700px] w-[700px] rounded-full bg-blue-500/[0.08] dark:bg-blue-700/[0.1] blur-[140px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[500px] -translate-y-1/2 rounded-full bg-indigo-500/[0.05] dark:bg-indigo-700/[0.06] blur-[100px]" />
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-slate-50 dark:from-[#06080f] to-transparent" />

      {/* Content grid — two columns */}
      <motion.div
        className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-28 pb-20 lg:grid-cols-[1fr_1.15fr] xl:gap-16"
        style={{ opacity }}
      >
        {/* Text column */}
        <motion.div className="text-center lg:text-left" style={{ y: contentY }}>
          <motion.div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-blue-500/[0.08] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300/80"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Professional 3D editor
          </motion.div>

          <h1 className="mb-6 font-black leading-[0.92] tracking-[-0.04em]" style={{ fontSize: 'clamp(40px,6vw,72px)' }}>
            <motion.span
              className="text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Build in{' '}
            </motion.span>
            <motion.span
              className="text-blue-600 dark:text-blue-500"
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              three
            </motion.span>
            <br />
            <motion.span
              className="text-slate-900 dark:text-white"
              initial={{ opacity: 0, y: 56 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.51, ease: [0.22, 1, 0.36, 1] }}
            >
              dimensions.
            </motion.span>
          </h1>

          <motion.p
            className="mx-auto mb-8 max-w-sm text-[16px] leading-[1.65] text-slate-500 dark:text-white/48 lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            Sketch floor plans in 2D, model in 3D, apply real materials.
            A precision tool built for architects and spatial designers.
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
          >
            <Link href="/signup" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-500 transition-colors sm:w-auto">
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/editor" className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-6 py-3.5 text-[14px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/[0.08] dark:hover:text-white sm:w-auto">
              Try without signing in
            </Link>
          </motion.div>

          {/* Feature chips */}
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            {CHIPS.map((c) => (
              <span key={c} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11.5px] font-medium text-slate-400 dark:border-white/[0.07] dark:bg-white/[0.02] dark:text-white/38">
                {c}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Visual column — different parallax rate */}
        <motion.div className="hidden lg:block" style={{ y: visualY }}>
          <FloorPlanSVG />
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="flex h-10 w-6 items-start justify-center rounded-full border border-slate-300 dark:border-white/18 pt-1.5"
        >
          <div className="h-2 w-1 rounded-full bg-slate-400 dark:bg-white/38" />
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
    <section className="bg-slate-50 dark:bg-[#06080f] border-y border-slate-200 dark:border-white/[0.07]">
      <div ref={ref} className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 dark:divide-white/[0.07] md:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center gap-1 px-6 py-10"
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: i * 0.09 }}
          >
            <span className="text-[28px] font-black tracking-tight text-slate-900 dark:text-white sm:text-[36px]">{s.value}</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400 dark:text-white/35">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── Features bento (3D scroll reveal) ───────────────────────────────────────

const FEATURES = [
  {
    icon: Layers,
    title: '3D + 2D Views',
    description: 'Switch between a full perspective viewport and a top-down floorplan. Every change syncs instantly.',
    accent: 'from-blue-600/15 to-indigo-600/10',
    iconBg: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
    wide: true,
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Design',
    description: 'Describe a room in plain language. Aruct generates the geometry for you.',
    accent: 'from-purple-600/15 to-pink-600/10',
    iconBg: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
    wide: false,
  },
  {
    icon: Palette,
    title: 'PBR Materials',
    description: 'Photorealistic physically-based materials. Import custom textures or source from Poly Haven.',
    accent: 'from-amber-600/15 to-orange-600/10',
    iconBg: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    wide: false,
  },
  {
    icon: Puzzle,
    title: 'Plugin Ecosystem',
    description: 'BOM reports, sun studies, section cuts, mesh editing, terrain — enable only what you need.',
    accent: 'from-emerald-600/15 to-teal-600/10',
    iconBg: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    wide: true,
  },
  {
    icon: Cloud,
    title: 'Cloud Scenes',
    description: 'Save scenes to your account. Invite teammates to collaborate in real-time.',
    accent: 'from-sky-600/15 to-cyan-600/10',
    iconBg: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
    wide: false,
  },
  {
    icon: Download,
    title: 'Open Format Export',
    description: 'Export to GLB, STL, OBJ, or DXF. Full interop with your toolchain.',
    accent: 'from-rose-600/15 to-red-600/10',
    iconBg: 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
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
      className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition-colors hover:border-slate-300 dark:border-white/[0.07] dark:bg-[#0a0d1c] dark:hover:border-white/[0.14] ${colSpan}`}
      initial={{ opacity: 0, y: 40, rotateX: 12 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: 'top center', transformPerspective: 800 }}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
      <div className={`relative mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.iconBg}`}>
        <feature.icon className="h-5 w-5" />
      </div>
      <h3 className="relative mb-2 text-[15px] font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
      <p className="relative text-[13px] leading-relaxed text-slate-500 dark:text-white/45">{feature.description}</p>
    </motion.div>
  )
}

function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const sectionY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%'])

  return (
    <motion.section ref={sectionRef} className="bg-slate-50 dark:bg-[#06080f] px-6 py-24 sm:py-32" style={{ y: sectionY }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400/70">Platform</p>
          <h2 className="mb-4 font-black tracking-tight text-slate-900 dark:text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Everything you need to design
          </h2>
          <p className="mx-auto max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-white/45">
            From concept sketch to construction documentation — Aruct covers the full workflow.
          </p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-3" style={{ perspective: '1200px' }}>
          <FeatureCard feature={FEATURES[0]!} index={0} inView={inView} colSpan="sm:col-span-2" />
          <FeatureCard feature={FEATURES[1]!} index={1} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[2]!} index={2} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[3]!} index={3} inView={inView} colSpan="sm:col-span-2" />
          <FeatureCard feature={FEATURES[4]!} index={4} inView={inView} colSpan="" />
          <FeatureCard feature={FEATURES[5]!} index={5} inView={inView} colSpan="sm:col-span-2" />
        </div>
      </div>
    </motion.section>
  )
}

// ─── Plugin capability showcase ───────────────────────────────────────────────

const PLUGIN_CARDS = [
  {
    icon: BarChart2,
    name: 'BOM Reports',
    desc: 'Auto-generate bill of materials directly from your scene model.',
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    tag: 'Analysis',
    tagColor: 'bg-blue-500/10 text-blue-500 dark:text-blue-400',
  },
  {
    icon: Sun,
    name: 'Sun Study',
    desc: 'Solar path analysis for any date, time, and geographic location.',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    tag: 'Analysis',
    tagColor: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
  },
  {
    icon: Scissors,
    name: 'Section Cuts',
    desc: 'Cut through walls and slabs at any angle to expose interior plans.',
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    tag: 'Documentation',
    tagColor: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
  },
  {
    icon: Box,
    name: 'Mesh Editor',
    desc: 'Low-poly modeling tools for organic shapes and custom geometry.',
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    tag: 'Modeling',
    tagColor: 'bg-purple-500/10 text-purple-500 dark:text-purple-400',
  },
  {
    icon: Mountain,
    name: 'Terrain',
    desc: 'Import real-world heightmap data and sculpt site topography.',
    color: 'text-green-500 dark:text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    tag: 'Site',
    tagColor: 'bg-green-500/10 text-green-500 dark:text-green-400',
  },
  {
    icon: Zap,
    name: 'Energy Analysis',
    desc: 'Thermal performance and load calculations from building geometry.',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    tag: 'Analysis',
    tagColor: 'bg-orange-500/10 text-orange-500 dark:text-orange-400',
  },
]

function PluginCard({ card, index, inView }: { card: (typeof PLUGIN_CARDS)[0]; index: number; inView: boolean }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], ['8deg', '-8deg']), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], ['-8deg', '8deg']), { stiffness: 200, damping: 20 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - rect.left) / rect.width - 0.5)
    my.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  function onMouseLeave() { mx.set(0); my.set(0) }

  return (
    <motion.div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 cursor-default dark:border-white/[0.07] dark:bg-[#0a0d1c]"
      initial={{ opacity: 0, y: 36, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 800 }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50/80 dark:from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
          <card.icon className="h-5 w-5" />
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${card.tagColor}`}>{card.tag}</span>
      </div>
      <h3 className="relative mb-1.5 text-[14px] font-semibold text-slate-900 dark:text-white">{card.name}</h3>
      <p className="relative text-[12.5px] leading-relaxed text-slate-500 dark:text-white/42">{card.desc}</p>

      <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </motion.div>
  )
}

function PluginShowcase() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-60px' })
  const gridInView = useInView(gridRef, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const sectionY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <motion.section ref={sectionRef} className="relative overflow-hidden bg-slate-50 dark:bg-[#06080f] border-y border-slate-200 dark:border-white/[0.07] px-6 py-24 sm:py-32" style={{ y: sectionY }}>
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-blue-500/[0.06] dark:bg-blue-900/[0.12] blur-[120px]" />
      </div>
      {/* Grid overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-40 text-slate-900 dark:text-white">
        <GridBg className="h-full w-full" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div ref={headerRef} className="mb-14 flex flex-col items-center gap-5 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <motion.p
              className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400/70"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              Plugin ecosystem
            </motion.p>
            <motion.h2
              className="font-black tracking-tight text-slate-900 dark:text-white"
              style={{ fontSize: 'clamp(28px,4vw,44px)' }}
              initial={{ opacity: 0, y: 25 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 }}
            >
              Extend only what you need
            </motion.h2>
            <motion.p
              className="mt-3 max-w-md text-[15px] text-slate-500 dark:text-white/45"
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              A focused core with specialist plugins available from the marketplace. Each is isolated and toggleable.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/plugins" className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/[0.08] dark:hover:text-white">
              Browse all plugins
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Plugin grid */}
        <div ref={gridRef} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLUGIN_CARDS.map((card, i) => (
            <PluginCard key={card.name} card={card} index={i} inView={gridInView} />
          ))}
        </div>

        <motion.p
          className="mt-8 text-center text-[12px] text-slate-400 dark:text-white/30"
          initial={{ opacity: 0 }}
          animate={gridInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          Also includes: Curtain Walls, Point Cloud, Schedules, Collaboration, Version History, Zone Rollup, Tripo AI, Poly Haven, DXF Export
        </motion.p>
      </div>
    </motion.section>
  )
}

// ─── Workflow ─────────────────────────────────────────────────────────────────

const STEPS = [
  { n: '01', title: 'Start with a sketch', body: 'Open the editor. Use the floorplan view to lay out rooms and spaces in 2D.' },
  { n: '02', title: 'Refine in 3D', body: 'Switch to the 3D viewport to adjust heights, add openings, apply materials.' },
  { n: '03', title: 'Enhance with plugins', body: 'Run a BOM report, sun study, or section cut with one-click plugins.' },
  { n: '04', title: 'Export or share', body: 'Save to your cloud account, invite teammates, or export to GLB / DXF.' },
]

function WorkflowSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const sectionY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <motion.section ref={sectionRef} className="bg-slate-50 dark:bg-[#06080f] px-6 py-24 sm:py-32" style={{ y: sectionY }}>
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400/70">How it works</p>
          <h2 className="font-black tracking-tight text-slate-900 dark:text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Designed for how architects work
          </h2>
        </motion.div>

        <div
          ref={ref}
          className="grid overflow-hidden rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-slate-200 dark:bg-white/[0.05] sm:grid-cols-2 lg:grid-cols-4"
          style={{ gap: 1 }}
        >
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="group relative bg-slate-50 dark:bg-[#06080f] p-8 overflow-hidden"
              initial={{ opacity: 0, y: 28 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Large bg number */}
              <div className="absolute -top-4 -left-1 select-none font-black leading-none tracking-[-0.05em] text-slate-200 dark:text-white/[0.04] pointer-events-none" style={{ fontSize: 120 }}>
                {s.n}
              </div>
              <div className="relative mb-5 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-[12px] font-bold text-blue-600 dark:text-blue-400">
                {s.n}
              </div>
              <h3 className="relative mb-2 text-[15px] font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="relative text-[13px] leading-relaxed text-slate-500 dark:text-white/45">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

const BULLETS = ['Local editor — always free', 'Cloud saves with Pro', 'Team collaboration with Studio']

function CTASection() {
  const sectionRef = useRef<HTMLElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const glowY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])

  return (
    <motion.section ref={sectionRef} className="relative overflow-hidden bg-slate-50 dark:bg-[#06080f] px-6 py-24 sm:py-32">
      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-blue-500/[0.06] dark:bg-blue-700/[0.09] blur-[130px]"
        style={{ y: glowY }}
      />

      <div
        ref={ref}
        className="relative mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white px-10 py-14 text-center dark:border-white/[0.08] dark:bg-[#0a0d1c] sm:px-16"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400/70">Get started</p>
          <h2 className="mb-4 font-black tracking-tight text-slate-900 dark:text-white" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
            Free to start.<br />Scales with your team.
          </h2>
          <p className="mb-8 text-[15px] leading-relaxed text-slate-500 dark:text-white/45">
            Start designing with no account required. Unlock cloud saves,
            real-time collaboration, and advanced plugins with a Pro or Studio plan.
          </p>

          <ul className="mb-10 inline-flex flex-col items-start gap-3 text-left">
            {BULLETS.map((b, i) => (
              <motion.li
                key={b}
                className="flex items-center gap-3 text-[14px] text-slate-600 dark:text-white/60"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                  <Check className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                </div>
                {b}
              </motion.li>
            ))}
          </ul>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/pricing" className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-7 py-3.5 text-[14px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white/65 dark:hover:bg-white/[0.08] dark:hover:text-white sm:w-auto">
              View pricing
            </Link>
            <Link href="/signup" className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-500 transition-colors sm:w-auto">
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.07] bg-slate-50 dark:bg-[#06080f] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900 dark:text-white">
          <AructMark className="h-[18px] w-[18px] text-blue-500" />
          Aruct
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px] text-slate-400 dark:text-white/35">
          <Link href="/editor" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Editor</Link>
          <Link href="/scenes" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Scenes</Link>
          <Link href="/pricing" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Pricing</Link>
          <Link href="/plugins" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Plugins</Link>
          <Link href="/contact" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Contact</Link>
          <Link href="/privacy" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-700 dark:hover:text-white/75 transition-colors">Terms</Link>
        </nav>
        <p className="text-[12px] text-slate-300 dark:text-white/25">© {new Date().getFullYear()} Aruct. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function LandingClient() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })

    let frame: number
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return (
    <div className="bg-slate-50 dark:bg-[#06080f] text-slate-900 dark:text-white antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PluginShowcase />
      <WorkflowSection />
      <CTASection />
      <Footer />
    </div>
  )
}
