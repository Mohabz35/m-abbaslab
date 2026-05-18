// middleware.ts — Route protection for /admin/* using httpOnly session cookie
// Note: Next.js 16 shows a deprecation warning but middleware still works.
// The new "proxy" API is not yet stable — keeping this as-is is correct.

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const { pathname } = request.nextUrl

  const isAuthenticated = session?.value === 'authenticated'

  // Allow login page through always
  if (pathname.startsWith('/admin/login')) {
    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
