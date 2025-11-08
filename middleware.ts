import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect admin users to admin dashboard from regular dashboard
    if (pathname.startsWith('/dashboard') && token?.role === 'administrator') {
      return NextResponse.redirect(new URL('/admin', req.url))
    }

    // Protect admin routes
    if (pathname.startsWith('/admin') && token?.role !== 'administrator') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Public routes
        if (
          pathname.startsWith('/auth') ||
          pathname === '/' ||
          pathname.startsWith('/api/auth')
        ) {
          return true
        }

        // Protected routes require token
        return !!token
      },
    },
    pages: {
      signIn: '/auth/sign-in',
    },
  }
)

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
