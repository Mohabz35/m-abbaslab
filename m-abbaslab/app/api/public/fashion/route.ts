import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET() {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
  }

  const { data, error } = await supabase.from('fashion_items').select('*').order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, items: data || [] })
}
