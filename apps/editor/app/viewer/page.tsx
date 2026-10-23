import type { Metadata } from 'next'
import { ViewerClient } from './viewer-client'

export const metadata: Metadata = {
  title: 'Aruct Viewer — Share & Embed 3D Scenes',
  description: 'Zero-install embeddable 3D scene viewer. Share a link or paste an iframe — clients see your work without signing up.',
}

export default function ViewerPage() {
  return <ViewerClient />
}
