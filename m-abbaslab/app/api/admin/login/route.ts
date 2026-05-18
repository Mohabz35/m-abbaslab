import { NextRequest, NextResponse } from 'next/server'
import { personalConfig } from '@/config/personal'
import { SignJWT } from 'jose'
import { logAudit } from '@/lib/audit'

// Simple in-memory brute force protection
const loginAttempts = new Map<string, { count: number, lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown_ip'
    const now = Date.now()

    // 1. Brute-force Check
    const attemptInfo = loginAttempts.get(ip)
    if (attemptInfo && attemptInfo.lockedUntil > now) {
      await logAudit('SECURITY_ALERT', `Locked out IP attempted login: ${ip}`)
      return NextResponse.json(
        { error: `Too many failed attempts. Locked until ${new Date(attemptInfo.lockedUntil).toLocaleTimeString()}` }, 
        { status: 429 }
      )
    }

    const { username, password } = await request.json()

    // @ts-ignore
    const configCreds = personalConfig.adminCredentials
    const isValidLocal = (!configCreds && username === 'ceo' && password === 'admin123')
    const isValidConfig = (configCreds && username === configCreds.username && password === configCreds.password)

    // 2. Authentication Logic
    if (isValidLocal || isValidConfig) {
      // Reset attempts on success
      loginAttempts.delete(ip)

      // Generate JWT (24h expiry)
      const token = await new SignJWT({ user: username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(JWT_SECRET)

      const response = NextResponse.json({ success: true })
      
      // Set secure HTTP-only cookie with token
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours in seconds
      })

      await logAudit('LOGIN_SUCCESS', `Admin login successful for user: ${username} from IP: ${ip}`)
      return response
    }

    // 3. Handle Failed Attempt
    const currentCount = attemptInfo ? attemptInfo.count + 1 : 1
    const lockedUntil = currentCount >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0
    
    loginAttempts.set(ip, { count: currentCount, lockedUntil })
    await logAudit('LOGIN_FAILED', `Failed login attempt ${currentCount}/${MAX_ATTEMPTS} for user: ${username} from IP: ${ip}`)

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  } catch (error) {
    console.error('Login error', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
