import type { Metadata } from 'next'
import { LandingClient } from '@/components/landing-client'

export const metadata: Metadata = {
  title: 'Aruct Editor — Design with depth. Build with precision.',
  description:
    'Professional 3D architectural editor for architects, designers, and space planners. AI-assisted design, PBR materials, plugins, and cloud collaboration.',
}

export default function LandingPage() {
  return <LandingClient />
}
