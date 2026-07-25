# Phase 1: Auth Foundation

## Goal

Sign up, sign in, sessions, protected routes — using Better Auth with Neon Postgres.

After this phase:
- Users can create accounts (email/password + OAuth: Google, GitHub)
- Sessions are managed via HTTP-only cookies
- The editor redirects unauthenticated users to `/login`
- User identity is available in all API routes and Server Components

---

## Better Auth Overview

Better Auth generates all auth tables (users, sessions, accounts, verifications) via its own migration system. It plugs into your existing Drizzle schema. All auth state lives in the same Neon database as scenes.

---

## Install

```bash
bun add better-auth
```

---

## Auth Schema (Better Auth generates this)

Better Auth will create these tables when you run `npx better-auth migrate`:

```
users         — id, name, email, emailVerified, image, createdAt, updatedAt
sessions      — id, userId, token, expiresAt, ipAddress, userAgent
accounts      — id, userId, provider, providerAccountId, ...OAuth fields
verifications — id, identifier, value, expiresAt
```

Also add these columns to your own schema for subscription data:

```typescript
// In apps/editor/lib/db/schema.ts — add:
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Subscription fields (populated by Phase 3)
  plan: text('plan', { enum: ['free', 'pro', 'team'] }).notNull().default('free'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id'),
  subscriptionStatus: text('subscription_status'),   // active | trialing | canceled | past_due
  planExpiresAt: timestamp('plan_expires_at'),
  // Platform role
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

> Better Auth reads its own tables independently. The `users` table above extends it with app-specific columns via the `additionalFields` config.

---

## Auth Config

Create `apps/editor/lib/auth.ts`:

```typescript
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client'
import * as schema from './db/schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      // session, account, verification: let Better Auth create these
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,  // send verification email before login
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,    // 30 days
    updateAge: 60 * 60 * 24,          // refresh session if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                 // client-side cookie cache: 5 min
    },
  },

  user: {
    additionalFields: {
      plan: { type: 'string', defaultValue: 'free' },
      role: { type: 'string', defaultValue: 'user' },
      stripeCustomerId: { type: 'string', required: false },
    },
  },

  trustedOrigins: [
    'https://ace.tucnow.in',
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3002',
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
```

---

## Auth API Route

Create `apps/editor/app/api/auth/[...all]/route.ts`:

```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

This single route handles ALL auth operations:
- `POST /api/auth/sign-up/email` — register
- `POST /api/auth/sign-in/email` — login
- `POST /api/auth/sign-out` — logout
- `GET  /api/auth/session` — current session
- `GET  /api/auth/callback/google` — OAuth callback
- etc.

---

## Middleware (Next.js Route Protection)

Create `apps/editor/middleware.ts`:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionFromCookie } from '@/lib/auth-server'

// Routes that require authentication
const PROTECTED_PATHS = ['/', '/scenes', '/scene']
// Routes that redirect authenticated users away
const AUTH_PATHS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await getSessionFromCookie(request)

  const isProtected = PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAuthRoute = AUTH_PATHS.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
```

Create `apps/editor/lib/auth-server.ts`:

```typescript
import { auth } from './auth'
import type { NextRequest } from 'next/server'
import { headers } from 'next/headers'

// For use in middleware (edge-compatible, reads cookie directly)
export async function getSessionFromCookie(request: NextRequest) {
  return auth.api.getSession({
    headers: Object.fromEntries(request.headers.entries()),
  })
}

// For use in Server Components / Route Handlers
export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

// Throws 401 if no session — use in API routes
export async function requireSession() {
  const session = await getSession()
  if (!session) throw new Error('unauthorized')
  return session
}
```

---

## Auth Client (Browser)

Create `apps/editor/lib/auth-client.ts`:

```typescript
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? '',
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient
```

---

## Pages

### Login Page — `apps/editor/app/login/page.tsx`

```
/login
  - Email/password form
  - "Continue with Google" button
  - "Continue with GitHub" button
  - Link to /signup
  - On success: redirect to ?next= or /
```

### Signup Page — `apps/editor/app/signup/page.tsx`

```
/signup
  - Name, email, password fields
  - "Continue with Google" button
  - Terms of service checkbox
  - On success: "Check your email to verify" screen
  - Link to /login
```

### Email Verification — `apps/editor/app/verify-email/page.tsx`

```
/verify-email?token=...
  - Verifies token from Better Auth
  - On success: redirect to / with toast "Email verified!"
  - On failure: "Invalid or expired link" + re-send option
```

---

## Email Provider

Better Auth sends transactional emails (verification, password reset). Configure with Resend:

```bash
bun add resend
```

```typescript
// In auth config, add:
emailVerification: {
  sendVerificationEmail: async ({ user, url }) => {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Arch Construct <noreply@ace.tucnow.in>',
      to: user.email,
      subject: 'Verify your email',
      html: `<a href="${url}">Click to verify</a>`,
    })
  },
},
```

---

## New Environment Variables

```bash
# Better Auth
BETTER_AUTH_SECRET="<random 32+ char string>"  # openssl rand -hex 32
BETTER_AUTH_URL="https://ace.tucnow.in"

# OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Email
RESEND_API_KEY="re_..."
```

---

## User Account UI

Add to `apps/editor/components/user-menu.tsx`:

```
Avatar (initials or photo)
  → Dropdown:
     • My Scenes
     • Account Settings
     • Subscription (→ billing portal)
     • Sign out
```

This component appears in `<Editor>` toolbar via the existing `viewerToolbarRight` slot.

---

## Verify Success

- [ ] `POST /api/auth/sign-up/email` creates user in Neon `users` table
- [ ] Email verification arrives from Resend
- [ ] `POST /api/auth/sign-in/email` sets `better-auth.session_token` cookie
- [ ] Visiting `/` without session → redirected to `/login`
- [ ] After login → redirected back to `/`
- [ ] `useSession()` in client returns the user object
- [ ] Sign out clears session cookie and redirects to `/login`
- [ ] Google OAuth flow completes end-to-end

---

## What Does NOT Change in This Phase

- Scene API authentication (`ARUCT_SCENE_API_TOKEN`) unchanged — programmatic/MCP access still token-based
- Editor functionality unchanged
- Scene data unchanged — `ownerId` column exists but is still nullable (set in Phase 2)
