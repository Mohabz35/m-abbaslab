import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'm-abbaslab-jwt-secret-2026-change-in-production'
)

function authBySecret(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-secret')
  return Boolean(process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET)
}

async function authBySession(request: NextRequest): Promise<boolean> {
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false

  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  if (authBySecret(request)) return true
  return authBySession(request)
}

async function fetchSupabaseStatus() {
  if (!hasSupabaseKeys) return null

  try {
    const { data, error } = await supabase
      .from('whatsapp_connection_status')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)

    if (error || !data?.length) return null
    return data[0]
  } catch {
    return null
  }
}

async function fetchEngineHealth() {
  const engineUrl = process.env.JARVIS_ENGINE_URL
  if (!engineUrl) return null

  try {
    const response = await fetch(engineUrl, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) return null

    const payload = await response.json()
    return {
      status: payload.status || 'unknown',
      service: payload.service || 'M-JARVIS WhatsApp Engine',
      is_connected: Boolean(payload.isConnected),
      connection_state: payload.connectionState || 'unknown',
      reconnect_attempts: payload.reconnectAttempts || 0,
      last_connected_at: payload.lastConnectedAt || null,
      last_disconnected_at: payload.lastDisconnectedAt || null,
      last_error: payload.lastError || null,
      updated_at: payload.timestamp || new Date().toISOString(),
      source: 'engine',
      raw: payload,
    }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseStatus = await fetchSupabaseStatus()
  if (supabaseStatus) {
    return NextResponse.json({
      success: true,
      source: 'supabase',
      status: supabaseStatus,
      engineUrl: process.env.JARVIS_ENGINE_URL || null,
    })
  }

  const engineHealth = await fetchEngineHealth()
  if (engineHealth) {
    return NextResponse.json({
      success: true,
      source: 'engine',
      status: engineHealth,
      engineUrl: process.env.JARVIS_ENGINE_URL || null,
    })
  }

  return NextResponse.json({
    success: false,
    error: 'Connection status unavailable.',
    engineUrl: process.env.JARVIS_ENGINE_URL || null,
  }, { status: 503 })
}

export async function POST(request: NextRequest) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const engineUrl = process.env.JARVIS_ENGINE_URL
  if (!engineUrl) {
    return NextResponse.json({ success: false, error: 'JARVIS_ENGINE_URL is not configured.' }, { status: 500 })
  }

  try {
    const response = await fetch(`${engineUrl.replace(/\/$/, '')}/reconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': process.env.ADMIN_SECRET || '',
      },
      cache: 'no-store',
    })

    const text = await response.text()
    let payload: any = null

    try {
      payload = JSON.parse(text)
    } catch {
      payload = { message: text }
    }

    return NextResponse.json({
      success: response.ok,
      status: payload,
    }, { status: response.ok ? 200 : response.status })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to trigger reconnect.',
    }, { status: 500 })
  }
}
