import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

const PROTECTED = ['/', '/scenes', '/scene', '/account']
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (!isProtected && !isAuthRoute) return NextResponse.next()

  const sessionCookie = request.cookies.get('__session')?.value
  let isAuthenticated = false

  if (sessionCookie) {
    try {
      await adminAuth.verifySessionCookie(sessionCookie, true)
      isAuthenticated = true
    } catch {
      // Expired or revoked cookie
    }
  }

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|icons|public).*)'],
}
