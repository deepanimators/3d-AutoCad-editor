# Phase 1: Auth Foundation — Firebase Auth

## Decision: Firebase Auth (replaces Better Auth)

User explicitly chose Firebase Auth for both email/password and social login.

### Firebase Auth vs Better Auth — Key Differences

| | Firebase Auth | Better Auth |
|---|---|---|
| Auth state lives in | Firebase (Google cloud) | Your Neon DB |
| User table | Firebase + mirror in your DB | Entirely in your DB |
| RBAC | Custom claims on JWT | Built-in plugin |
| SSO/SAML | Firebase SAML provider | Plugin |
| Pricing | Free (Spark) up to 10k MAU/month | Self-hosted, free |
| Next.js SSR | Needs session cookie bridge | Native |
| Admin SDK | Firebase Admin | N/A |
| MFA | ✅ Built-in | ✅ Plugin |
| DX | Firebase console | Code-only |

**Trade-off:** Firebase Auth is free and handles email verification, password reset, MFA, and social OAuth (Google, GitHub, Apple, etc.) out of the box. The downside is you need a session cookie bridge for SSR (Next.js middleware can't call Firebase client SDK — it runs on edge). This is solved with Firebase's `createSessionCookie` API.

---

## Architecture: Firebase + Next.js SSR

```
Browser                     Next.js Server          Firebase
  │                              │                      │
  ├── signIn() (Firebase SDK) ──────────────────────────►│
  │◄── ID Token (JWT, 1hr) ─────────────────────────────┤
  │                              │                      │
  ├── POST /api/auth/session ───►│                      │
  │   body: { idToken }          ├── verifyIdToken() ──►│
  │                              │◄── decoded token ────┤
  │                              ├── createSessionCookie()►│
  │◄── Set-Cookie: __session ────┤                      │
  │                              │                      │
  ├── GET / (next request) ─────►│                      │
  │   Cookie: __session          ├── verifySessionCookie()►│
  │                              │◄── user uid, claims ─┤
  │                              │                      │
```

The `__session` cookie is HTTP-only, Secure, SameSite=Strict, valid for up to 14 days (configurable). Firebase Admin SDK verifies it on every server request — no database round-trip for session check.

---

## Install

```bash
# Client-side Firebase
bun add firebase

# Server-side Firebase Admin
bun add firebase-admin
```

---

## Environment Variables

```bash
# Firebase Client (public — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="ace-tucnow.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="ace-tucnow"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="ace-tucnow.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."

# Firebase Admin (server-only — NEVER expose to client)
FIREBASE_PROJECT_ID="ace-tucnow"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@ace-tucnow.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

Get the Admin SDK credentials from Firebase Console → Project Settings → Service Accounts → Generate new private key.

---

## Firebase Console Setup

1. **Create Firebase project** at `console.firebase.google.com`
2. **Enable Authentication** → Sign-in methods:
   - Email/Password ✅
   - Google ✅
   - GitHub ✅ (needs GitHub OAuth app)
3. **Add authorized domains:** `ace.tucnow.in`, `localhost`
4. **Configure email templates** (verification, password reset) — branded with Arch Construct name/logo

---

## Client Firebase Config

`apps/editor/lib/firebase/client.ts`:

```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!
export const auth = getAuth(app)
```

---

## Server Firebase Admin Config

`apps/editor/lib/firebase/admin.ts`:

```typescript
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        // Vercel env vars strip \n — restore them
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      }),
    })
  : getApps()[0]!

export const adminAuth = getAuth(app)
```

---

## Session Cookie API

`apps/editor/app/api/auth/session/route.ts`:

```typescript
import { adminAuth } from '@/lib/firebase/admin'
import { db } from '@/lib/db/client'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000  // 14 days

export async function POST(request: Request) {
  const { idToken } = await request.json()
  if (!idToken) return Response.json({ error: 'missing_token' }, { status: 400 })

  let decodedToken
  try {
    // Verify the ID token first (prevents replay attacks)
    decodedToken = await adminAuth.verifyIdToken(idToken, true)
  } catch {
    return Response.json({ error: 'invalid_token' }, { status: 401 })
  }

  // Upsert user in our DB (first login creates the record)
  await upsertUser(decodedToken)

  // Create session cookie (Firebase manages rotation + revocation)
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  })

  const cookieStore = await cookies()
  cookieStore.set('__session', sessionCookie, {
    maxAge: SESSION_DURATION_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('__session')
  return Response.json({ ok: true })
}

async function upsertUser(token: { uid: string; email?: string; name?: string; picture?: string }) {
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.firebaseUid, token.uid))
  if (existing.length > 0) return

  await db.insert(users).values({
    id: token.uid,                // use Firebase UID as primary key — no mapping table needed
    firebaseUid: token.uid,
    email: token.email ?? '',
    name: token.name ?? token.email ?? 'User',
    image: token.picture ?? null,
    plan: 'free',
    role: 'user',
  }).onConflictDoNothing()
}
```

---

## Users Table Update

Add `firebaseUid` to schema (or just use Firebase UID as the primary key directly):

```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey(),          // = Firebase UID
  firebaseUid: text('firebase_uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  image: text('image'),
  plan: text('plan', { enum: ['free', 'pro', 'team'] }).notNull().default('free'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),
  planExpiresAt: timestamp('plan_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

---

## Session Helpers (Server Components + API Routes)

`apps/editor/lib/auth-server.ts`:

```typescript
import { adminAuth } from './firebase/admin'
import { db } from './db/client'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'

export type AppUser = typeof users.$inferSelect

export async function getSession(): Promise<AppUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('__session')?.value
  if (!sessionCookie) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, decoded.uid))
    return user ?? null
  } catch {
    return null
  }
}

// Edge-compatible — for middleware (cannot use next/headers)
export async function getSessionFromRequest(request: NextRequest): Promise<{ uid: string } | null> {
  const sessionCookie = request.cookies.get('__session')?.value
  if (!sessionCookie) return null

  try {
    // NOTE: firebase-admin does NOT run on the edge runtime.
    // Use a lightweight JWT decode + public key check, OR
    // move middleware to Node.js runtime (recommended for Next.js 16).
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
    return { uid: decoded.uid }
  } catch {
    return null
  }
}

export async function requireSession(): Promise<AppUser> {
  const user = await getSession()
  if (!user) throw Object.assign(new Error('unauthorized'), { status: 401 })
  return user
}
```

> **Edge Runtime Note:** Firebase Admin SDK does not run on Vercel's edge runtime. Set Next.js middleware runtime to `nodejs` (default in Next.js 16 App Router — no change needed):
> ```typescript
> // middleware.ts
> export const runtime = 'nodejs'  // default, explicit for clarity
> ```

---

## Middleware

`apps/editor/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const PROTECTED = ['/', '/scenes', '/scene', '/account', '/pricing']
const AUTH_ONLY = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get('__session')?.value

  let isAuthenticated = false
  if (sessionCookie) {
    try {
      await adminAuth.verifySessionCookie(sessionCookie, true)
      isAuthenticated = true
    } catch {
      // Invalid or revoked cookie — treat as unauthenticated
    }
  }

  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthRoute = AUTH_ONLY.some(p => pathname.startsWith(p))

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## Client Auth Hook

`apps/editor/lib/use-auth.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from './firebase/client'

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null | undefined>(undefined)  // undefined = loading

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
  }, [])

  return { user, loading: user === undefined }
}
```

---

## Sign In / Sign Up Flow

`apps/editor/lib/auth-actions.ts` (client-side):

```typescript
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from './firebase/client'

async function exchangeTokenForSession(user: { getIdToken: () => Promise<string> }) {
  const idToken = await user.getIdToken()
  await fetch('/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  })
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await sendEmailVerification(user)
  await exchangeTokenForSession(user)
  return user
}

export async function signInWithEmail(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  await exchangeTokenForSession(user)
  return user
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  await exchangeTokenForSession(user)
  return user
}

export async function signInWithGitHub() {
  const provider = new GithubAuthProvider()
  const { user } = await signInWithPopup(auth, provider)
  await exchangeTokenForSession(user)
  return user
}

export async function signOut() {
  await firebaseSignOut(auth)
  await fetch('/api/auth/session', { method: 'DELETE' })
  window.location.href = '/login'
}
```

---

## Pages

### `/login` — Sign In

```
Email input
Password input + show/hide toggle
[Sign In with Email]
──── or ────
[Continue with Google]   (Google logo)
[Continue with GitHub]   (GitHub logo)

Forgot password? → sends Firebase password reset email

Don't have an account? → /signup
```

Error states: `auth/user-not-found`, `auth/wrong-password` → show inline error, never "user not found" (security)

### `/signup` — Register

```
Name input
Email input
Password input (min 8 chars, strength meter)
[Create Account]
──── or ────
[Continue with Google]
[Continue with GitHub]

By creating an account you agree to [Terms] and [Privacy Policy]

Already have an account? → /login
```

After email signup → show "Check your email" screen (Firebase sends verification automatically).

### `/verify-email` — Email Verification

Firebase handles email link verification. After clicking the link, user is redirected back to the app and Firebase Auth state updates automatically. Optionally: `apps/editor/app/verify-email/page.tsx` as a landing page.

---

## Firebase Custom Claims (RBAC in JWT)

To avoid a DB round-trip on every request just to check `plan` and `role`, use Firebase Custom Claims — they're embedded in the JWT and verified in `verifySessionCookie`:

```typescript
// Set when plan changes (in webhook handler)
await adminAuth.setCustomUserClaims(firebaseUid, {
  plan: 'pro',     // 'free' | 'pro' | 'team'
  role: 'user',    // 'user' | 'admin'
})
```

Then in middleware / API routes:
```typescript
const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)
const plan = decoded.plan ?? 'free'
const role = decoded.role ?? 'user'
// No DB query needed for feature gates
```

Custom claims are refreshed when the client calls `user.getIdToken(true)` (force refresh). Call this after a successful Stripe webhook updates the plan.

---

## Firebase vs Better Auth — What Changes in Other Phases

| Phase | Change |
|-------|--------|
| Phase 2 RBAC | No change — same `getSession()` interface, same DB ownership checks |
| Phase 3 Stripe | Webhook calls `adminAuth.setCustomUserClaims(uid, { plan })` after plan update |
| Phase 4 Enterprise / SSO | Firebase supports SAML providers natively (Enterprise plan ~$0.06/MAU) |
| Phase 4 Orgs | Firebase has no org concept — must implement in your DB (same plan as before) |

---

## Firebase Pricing Note

Firebase Authentication pricing:
- **Spark (free):** 10,000 MAU/month — more than enough to start
- **Blaze (pay-as-you-go):** $0.0055/MAU above 10k → at 50k MAU = $220/month
- Email/password and social login: **free at all tiers**
- Phone auth (SMS OTP): $0.006/verification (if you add it later)
- SAML/OIDC for SSO: requires Blaze plan, $0.06/MAU for SSO users

---

## Verify Success

- [ ] Firebase project created with Email, Google, GitHub providers enabled
- [ ] `POST /api/auth/session` with valid Firebase ID token → sets `__session` cookie
- [ ] `/` without cookie → redirect to `/login`
- [ ] Email signup → Firebase sends verification email
- [ ] Google sign-in popup completes → user in Neon `users` table
- [ ] `getSession()` in Server Component returns user object
- [ ] `POST /api/auth/session DELETE` → clears cookie
- [ ] `adminAuth.setCustomUserClaims(uid, { plan: 'pro' })` → next `verifySessionCookie` returns `plan: 'pro'` in decoded token
- [ ] Password reset email arrives from Firebase
