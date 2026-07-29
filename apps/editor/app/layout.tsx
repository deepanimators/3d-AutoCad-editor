import { Agentation } from 'agentation'
import { GeistPixelSquare } from 'geist/font/pixel'
import { Barlow } from 'next/font/google'
import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { ThemeProvider } from 'next-themes'
import { ClientBootstrap } from './client-bootstrap'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Aruct Editor', template: '%s — Aruct Editor' },
  description: 'Design with depth. Build with precision. Professional 3D architectural editor for architects, designers, and space planners.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://aruct.com'),
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Aruct Editor',
    title: 'Aruct Editor — Design with depth. Build with precision.',
    description: 'Professional 3D architectural editor for architects, designers, and space planners.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Aruct Editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aruct Editor',
    description: 'Professional 3D architectural editor.',
    images: ['/og-image.png'],
  },
}

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-barlow',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const enableDevDiagnostics =
    process.env.NODE_ENV === 'development' && process.env.ARUCT_DEV_DIAGNOSTICS === '1'

  return (
    <html
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${GeistPixelSquare.variable} ${barlow.variable}`}
      lang="en"
    >
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ClientBootstrap enableDevDiagnostics={enableDevDiagnostics}>{children}</ClientBootstrap>
          {enableDevDiagnostics && <Agentation />}
        </ThemeProvider>
      </body>
    </html>
  )
}
