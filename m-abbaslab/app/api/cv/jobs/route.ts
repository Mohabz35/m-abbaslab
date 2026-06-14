import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!hasSupabaseKeys) return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })
  
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const { data: user } = await supabase.from('cv_users').select('id').eq('email', email).single()
    if (!user) return NextResponse.json({ jobs: [] })

    const { data: jobs, error } = await supabase
      .from('cv_tracked_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ jobs: jobs || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseKeys) return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })

  try {
    const { email, company, role, platform, job_url, job_description, status, notes } = await request.json()
    if (!email || !company || !role) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })

    const { data: user } = await supabase.from('cv_users').select('id').eq('email', email).single()
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data, error } = await supabase
      .from('cv_tracked_jobs')
      .insert({
        user_id: user.id,
        company,
        role,
        platform,
        job_url,
        job_description,
        status: status || 'saved',
        notes
      })
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ job: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasSupabaseKeys) return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })

  try {
    const { id, status, notes } = await request.json()
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 })

    const updates: any = { updated_at: new Date().toISOString() }
    if (status) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const { data, error } = await supabase
      .from('cv_tracked_jobs')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return NextResponse.json({ job: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasSupabaseKeys) return NextResponse.json({ error: 'Supabase keys not configured' }, { status: 500 })

  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 })

    const { error } = await supabase.from('cv_tracked_jobs').delete().eq('id', id)
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
