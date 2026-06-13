import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')

  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const { data: user } = await supabase
      .from('cv_users')
      .select('id')
      .eq('email', email)
      .single()

    if (!user) return NextResponse.json({ generations: [] })

    const { data: generations } = await supabase
      .from('cv_generations')
      .select('id, target_platform, ats_score, is_paid, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ generations: generations || [] })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
