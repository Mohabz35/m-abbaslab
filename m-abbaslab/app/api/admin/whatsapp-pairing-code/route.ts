import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    return null
  }

  return createClient(url, key)
}

export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' },
        { status: 500 }
      )
    }

    const { data, error } = await supabase
      .from('whatsapp_connection_status')
      .select('pairing_code, status, is_connected, updated_at')
      .eq('id', 'primary')
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' },
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

    if (error) throw error

    return NextResponse.json({ message: 'Reconnection triggered' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
