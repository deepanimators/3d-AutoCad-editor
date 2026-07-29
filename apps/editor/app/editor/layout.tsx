import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor',
  description: 'Build and design in 3D with the Aruct Editor.',
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
