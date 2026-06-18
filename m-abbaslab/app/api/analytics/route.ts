import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!hasSupabaseKeys) {
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const { event_type, page_path, page_title, referrer, metadata } = body

    if (!event_type || !page_path) {
      return NextResponse.json({ success: true })
    }

    // Parse user agent for device/browser info
    const userAgent = request.headers.get('user-agent') || ''
    let deviceType = 'desktop'
    if (/mobile|android|iphone/i.test(userAgent)) deviceType = 'mobile'
    else if (/tablet|ipad/i.test(userAgent)) deviceType = 'tablet'

    let browser = 'Other'
    if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'
    else if (/edge/i.test(userAgent)) browser = 'Edge'

    // Get visitor ID from cookie or generate one
    const visitorId = request.cookies.get('visitor_id')?.value || crypto.randomUUID()
    const sessionId = request.cookies.get('session_id')?.value || crypto.randomUUID()

    // Get country from headers (Vercel provides this)
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown'

    await supabase.from('analytics_events').insert({
      event_type,
      page_path,
      page_title: page_title || '',
      visitor_id: visitorId,
      session_id: sessionId,
      referrer: referrer || '',
      user_agent: userAgent.substring(0, 500),
      device_type: deviceType,
      browser,
      country,
      metadata: metadata || {},
    })

    const response = NextResponse.json({ success: true })

    // Set visitor ID cookie if not set
    if (!request.cookies.get('visitor_id')) {
      response.cookies.set('visitor_id', visitorId, {
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      })
    }
    if (!request.cookies.get('session_id')) {
      response.cookies.set('session_id', sessionId, {
        maxAge: 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return response
  } catch (error) {
    return NextResponse.json({ success: true })
  }
}
