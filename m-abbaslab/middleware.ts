// middleware.ts — Route protection for /admin/* and /portal/* using JWT httpOnly session cookie
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  const qisSession = request.cookies.get('sb-nspzkkemwaaokpiykfvv-auth-token')
  const { pathname } = request.nextUrl

  let isAdmin = false
  let isQISAuth = false

  if (session?.value) {
    try {
      await jwtVerify(session.value, JWT_SECRET)
      isAdmin = true
    } catch { /* invalid */ }
  }

  if (qisSession?.value) {
    isQISAuth = true
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
      if (session) response.cookies.delete('admin_session')
      return response
    }
  }

  // Allow /portal access — auth handled client-side via Supabase
  // Portal pages check auth and redirect to QIS landing if not logged in

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
