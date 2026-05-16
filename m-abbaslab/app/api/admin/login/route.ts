import { NextRequest, NextResponse } from 'next/server'
import { personalConfig } from '@/config/personal'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // @ts-ignore - adminCredentials might not be fully typed yet
    const configCreds = personalConfig.adminCredentials

    if (!configCreds) {
      // Fallback if config is malformed
      if (username === 'ceo' && password === 'admin123') {
        const response = NextResponse.json({ success: true })
        response.cookies.set('admin_session', 'authenticated', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        })
        return response
      }
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (username === configCreds.username && password === configCreds.password) {
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
      return response
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
