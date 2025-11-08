# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application for a Dutch law scraper UI, built with React 19, TypeScript, and Tailwind CSS v4. The project uses shadcn/ui components (New York style) and integrates with Firebase for authentication and data storage.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture

### Configuration System

All environment variables are centralized in `config.ts` at the root level. This file:
- Provides default values to prevent build errors
- Handles runtime environment detection (Vercel, Cloud Run, development)
- Supports both client-side (Firebase) and server-side (Firebase Admin) configuration
- Has a `validateConfig()` function that skips validation during build time

**Always use `config.ts` to access environment variables, never access `process.env` directly.**

### Firebase Integration

The app uses dual Firebase setups:

1. **Client-side** (`lib/firebase.ts`): Exports `auth`, `db`, and `storage` for client components
2. **Server-side** (`lib/firebase-admin.ts`): Exports `getAdminAuth()` and `getAdminDb()` for server operations
   - Uses lazy initialization to prevent build-time errors
   - Supports both service account credentials and Application Default Credentials (Cloud Run)
   - Exports proxy objects `adminAuth` and `adminDb` for backward compatibility

### Path Aliases

The project uses `@/*` for all imports (configured in `tsconfig.json` and `components.json`):
- `@/components` - UI components
- `@/lib/utils` - Utility functions
- `@/lib` - Library code
- `@/hooks` - React hooks

### Styling

- Tailwind CSS v4 with PostCSS
- Uses `cn()` utility from `lib/utils.ts` for conditional class merging
- shadcn/ui components with CSS variables for theming
- Base color: neutral
- Fonts: Geist Sans and Geist Mono (auto-optimized via next/font)

## Environment Variables

Required environment variables (see `config.ts` for complete list):

**Client-side (NEXT_PUBLIC prefix):**
- Firebase config: API key, auth domain, project ID, storage bucket, messaging sender ID, app ID

**Server-side:**
- `AUTH_FIREBASE_PROJECT_ID`, `AUTH_FIREBASE_CLIENT_EMAIL`, `AUTH_FIREBASE_PRIVATE_KEY`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Optional: Resend (email), Google OAuth credentials

Store these in `.env.local` (not committed to git).

## Authentication System

The app uses NextAuth.js v4 with JWT sessions for authentication:

### Authentication Flow

1. **User Creation**:
   - Users must be created manually by administrators in Firebase Console
   - Navigate to Firestore Database → `users` collection
   - Create document with: name, email, password (bcrypt-hashed), role ('customer' or 'administrator')
   - Password can be hashed using: `node scripts/hash-password.js YOUR_PASSWORD`
   - See `scripts/create-user.md` for detailed instructions

2. **Sign In** (`app/auth/sign-in/page.tsx`):
   - Credentials validated against Firestore users collection
   - bcrypt compares password hash
   - JWT token created with user ID and role
   - Redirects to `/dashboard` or `/admin` based on role

3. **Session Management**:
   - JWT tokens include: `id`, `role`
   - Session available via `useSession()` hook in client components
   - Server-side: `getSession()` from `@/lib/auth`
   - SessionProvider wraps entire app in root layout

### Route Protection

**Middleware** (`middleware.ts`):
- Protected routes: `/dashboard/*`, `/admin/*`
- Public routes: `/`, `/auth/*`, `/api/auth/*`
- Admin users accessing `/dashboard` auto-redirect to `/admin`
- Non-admin users accessing `/admin` redirect to `/dashboard`
- Unauthenticated users redirect to `/auth/sign-in`

### User Roles

- `customer`: Default role for users, access to `/dashboard`
- `administrator`: Admin role, access to `/admin` dashboard with token refresh capabilities

### Key Files

- `lib/auth.ts`: NextAuth configuration, session helpers
- `lib/validations/auth-schemas.ts`: Zod validation schemas
- `types/next-auth.d.ts`: TypeScript type extensions
- `app/api/auth/[...nextauth]/route.ts`: NextAuth API handler
- `components/providers/session-provider.tsx`: Client-side session wrapper

### Firestore User Collection Structure

```typescript
{
  name: string
  email: string
  password: string  // bcrypt hashed
  role: 'customer' | 'administrator'
  createdAt: string
  updatedAt: string
}
```

### Authentication in API Routes

```typescript
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Your logic here
}
```

## Build and Deployment Considerations

- The app supports multiple deployment targets: Vercel, Cloud Run, and standard Node.js
- Firebase Admin initialization is skipped during build phase (`NEXT_PHASE === 'phase-production-build'`)
- Runtime environment is detected via `config.runtime` properties
- `NEXTAUTH_SECRET` must be set in production (generate with: `openssl rand -base64 32`)
- Firebase service account credentials required for server-side auth operations
