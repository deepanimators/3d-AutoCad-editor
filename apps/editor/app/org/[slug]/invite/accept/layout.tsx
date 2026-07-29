import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Accept Invitation',
  description: 'Accept your invitation to join an Aruct organization.',
}

export default function InviteAcceptLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
