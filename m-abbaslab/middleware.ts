// middleware.ts — Route protection for /admin/* using JWT httpOnly session cookie
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const { pathname } = request.nextUrl

  let isAdmin = false

  if (session?.value) {
    try {
      const { payload } = await jwtVerify(session.value, JWT_SECRET, {
        issuer: 'm-abbaslab',
        audience: 'admin',
      })
      isAdmin = !!payload.user
    } catch { /* invalid or expired token */ }
  }

  // Allow login page through always
  if (pathname.startsWith('/admin/login')) {
    if (isAdmin) return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    return NextResponse.next()
  }

  // Protect /admin/* routes
  if (pathname.startsWith('/admin')) {
    if (!isAdmin) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      const response = NextResponse.redirect(loginUrl)
      // Clear invalid cookie
      if (session) response.cookies.delete('admin_session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
