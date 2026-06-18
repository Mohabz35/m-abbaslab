import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/admin-auth'
import { supabase } from '@/lib/supabase'

// In-memory rate limiting (resets on server restart - use Redis in production)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown_ip'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const now = Date.now()

    // 1. Rate Limiting Check
    const attemptInfo = loginAttempts.get(ip)
    if (attemptInfo && attemptInfo.lockedUntil > now) {
      const remaining = Math.ceil((attemptInfo.lockedUntil - now) / 60000)
      await supabase.from('security_events').insert({
        event_type: 'rate_limit',
        ip_address: ip,
        user_agent: userAgent,
        details: { remaining_minutes: remaining },
        severity: 'warning',
      })
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${remaining} minutes.` },
        { status: 429 }
      )
    }

    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }

    // 2. Authenticate against Supabase admin_users table
    const result = await authenticateAdmin(username, password)

    if (result.error) {
      // Track failed attempt
      const currentCount = attemptInfo ? attemptInfo.count + 1 : 1
      const lockedUntil = currentCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0
      loginAttempts.set(ip, { count: currentCount, lockedUntil })

      await supabase.from('security_events').insert({
        event_type: 'failed_login',
        username,
        ip_address: ip,
        user_agent: userAgent,
        details: { attempt: currentCount, max_attempts: MAX_ATTEMPTS },
        severity: currentCount >= 3 ? 'critical' : 'warning',
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // 3. Success - clear rate limit
    loginAttempts.delete(ip)

    const response = NextResponse.json({
      success: true,
      user: result.user,
    })

    // Set secure HTTP-only cookie
    response.cookies.set('admin_session', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
