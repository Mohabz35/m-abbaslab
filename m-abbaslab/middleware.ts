// middleware.ts — Route protection for /admin/* using JWT httpOnly session cookie
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const { pathname } = request.nextUrl

  let isAuthenticated = false

  if (session?.value) {
    try {
      // Verify JWT signature and expiration
      await jwtVerify(session.value, JWT_SECRET)
      isAuthenticated = true
    } catch (error) {
      console.warn("JWT verification failed:", error)
    }
  }

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
      // Delete invalid cookie if it exists
      const response = NextResponse.redirect(loginUrl)
      if (session) response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
