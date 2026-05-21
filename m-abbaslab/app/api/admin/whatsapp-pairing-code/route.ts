import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
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
