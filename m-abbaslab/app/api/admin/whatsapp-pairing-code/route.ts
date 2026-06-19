import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function isAuthorized(request: any): Promise<boolean> {
  const header = request.headers?.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies?.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { pairing_code: null, status: 'disconnected', is_connected: false, error: 'Supabase env vars missing' },
        { status: 200 }
      )
    }

    const { data, error } = await supabase
      .from('whatsapp_connection_status')
      .select('pairing_code, status, is_connected, updated_at')
      .eq('id', 'primary')
      .single()

    if (error) {
      // Table doesn't exist or other error — return safe defaults
      if (error.code === '42P01' || error.code === 'PGRST116') {
        return NextResponse.json({ pairing_code: null, status: 'disconnected', is_connected: false })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ pairing_code: null, status: 'error', is_connected: false, error: error.message }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase env vars missing' },
        { status: 500 }
      )
    }

    // Trigger reconnection by updating status to 'reconnecting'
    const { error } = await supabase
      .from('whatsapp_connection_status')
      .upsert({
        id: 'primary',
        status: 'reconnecting',
        is_connected: false,
        pairing_code: null,
        updated_at: new Date().toISOString()
      })

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ message: 'WhatsApp tables not configured. Run supabase-migrations.sql first.' })
      }
      throw error
    }

    return NextResponse.json({ message: 'Reconnection triggered' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
