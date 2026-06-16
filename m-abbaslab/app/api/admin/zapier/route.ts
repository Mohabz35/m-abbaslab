import { NextRequest, NextResponse } from 'next/server'
import { triggerZap } from '@/lib/zapier'
import { logAudit } from '@/lib/audit'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_abbaslab_2026_change_in_production'
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try { await jwtVerify(session.value, JWT_SECRET); return true } catch { return false }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Authentication
    if (!(await isAuthorized(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse payload
    const { eventName, payload } = await request.json()

    if (!eventName) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 })
    }

    // 3. Trigger Zapier
    const success = await triggerZap(eventName, payload)

    // 4. Log Audit
    await logAudit(
      success ? 'ZAPIER_TRIGGER_SUCCESS' : 'ZAPIER_TRIGGER_FAILED', 
      `Triggered '${eventName}' with payload: ${JSON.stringify(payload)}`
    )

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Zapier Webhook Failed or Not Configured' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Zapier API Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}
