import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // In a production app, these would come from an AI API or news aggregation service.
    // For now, we mock the intelligence feed.
    const wisdomFeed = [
      { id: 1, type: 'alert', message: 'Vercel Deployment is healthy but approaching bandwidth limit.', timestamp: new Date().toISOString() },
      { id: 2, type: 'insight', message: 'Articles published on Tuesday mornings show a 24% higher read rate.', timestamp: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, type: 'action', message: 'You have 3 Alphas in the queue ready for testing.', timestamp: new Date(Date.now() - 7200000).toISOString() },
      { id: 4, type: 'news', message: 'AI model breakthroughs in Quant Finance announced yesterday.', timestamp: new Date(Date.now() - 86400000).toISOString() }
    ]

    return NextResponse.json({ success: true, feed: wisdomFeed })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
