'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Mail, MessageSquare, Send } from 'lucide-react'

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

const SUBJECTS = [
  'Feature request',
  'Bug report',
  'Billing question',
  'Plugin enquiry',
  'Enterprise / team plan',
  'Other',
]

export default function ContactPage() {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]!)
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = data.get('name') as string
    const email = data.get('email') as string
    const message = data.get('message') as string
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`)
    window.location.href = `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[#06080f] text-white antialiased">
      {/* Header */}
      <header className="border-b border-white/[0.07] bg-[#06080f]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-[15px] text-white">
            <AructMark className="h-[18px] w-[18px] text-blue-500" />
            Aruct
          </Link>
          <Link href="/" className="text-[13px] text-white/40 hover:text-white/70 transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-20">
        {/* Page heading */}
        <div className="mb-16 text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h1 className="mb-4 text-[clamp(32px,5vw,52px)] font-black tracking-tight text-white">
            Get in touch
          </h1>
          <p className="mx-auto max-w-sm text-[16px] leading-relaxed text-white/45">
            Have a question, a feature idea, or need help? Send us a message and we&apos;ll get back to you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Contact form */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d1c] p-8">
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                  <Send className="h-6 w-6 text-green-400" />
                </div>
                <h2 className="text-[20px] font-bold text-white">Message sent!</h2>
                <p className="max-w-xs text-[14px] text-white/50">
                  Your email client should have opened. We&apos;ll reply to you at your provided email address.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-2 text-[13px] text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/55" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-white/55" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:outline-none focus:ring-0 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-white/55">
                    Subject
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                          subject === s
                            ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                            : 'border-white/[0.1] bg-white/[0.03] text-white/45 hover:border-white/[0.18] hover:text-white/70'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-white/55" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell us what's on your mind…"
                    className="w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:outline-none focus:ring-0 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-[14px] font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Send message
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d1c] p-7">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="mb-1.5 text-[15px] font-semibold text-white">Email us directly</h3>
              <p className="mb-4 text-[13px] leading-relaxed text-white/45">
                Prefer to write your own email? Reach us at:
              </p>
              <a
                href="mailto:support@aruct.com"
                className="text-[14px] font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                support@aruct.com
              </a>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d1c] p-7">
              <h3 className="mb-3 text-[15px] font-semibold text-white">Common topics</h3>
              <ul className="space-y-3 text-[13px] text-white/45">
                <li>Feature requests and product feedback</li>
                <li>Bug reports and technical issues</li>
                <li>Billing, plans, and upgrades</li>
                <li>Plugin development enquiries</li>
                <li>Enterprise and team licensing</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0d1c] p-7">
              <h3 className="mb-3 text-[15px] font-semibold text-white">Quick links</h3>
              <div className="flex flex-col gap-2">
                <Link href="/pricing" className="text-[13px] text-white/45 hover:text-white/75 transition-colors">
                  View pricing plans →
                </Link>
                <Link href="/plugins" className="text-[13px] text-white/45 hover:text-white/75 transition-colors">
                  Browse plugins →
                </Link>
                <Link href="/editor" className="text-[13px] text-white/45 hover:text-white/75 transition-colors">
                  Try the editor →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/[0.07] px-6 py-8 text-center text-[12px] text-white/25">
        © {new Date().getFullYear()} Aruct. All rights reserved.
        <span className="mx-2">·</span>
        <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
      </footer>
    </div>
  )
}
