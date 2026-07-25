import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/', '/scenes', '/scene', '/account']
const AUTH_ROUTES = ['/login', '/signup']

// Middleware runs in Edge runtime — firebase-admin (Node.js only) cannot be used here.
// Cookie presence check handles routing/UX; cryptographic verification happens in
// server components and API routes via lib/auth-server.ts (getSession/requireSession).
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const hasSession = !!request.cookies.get('__session')?.value

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|icons|public).*)'],
}
