import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!hasSupabaseKeys) {
    return NextResponse.json({ view_count: 0, like_count: 0 })
  }

  const { data } = await supabase
    .from('articles')
    .select('view_count, like_count')
    .eq('id', id)
    .single()

  return NextResponse.json({
    view_count: data?.view_count || 0,
    like_count: data?.like_count || 0,
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { action } = body

  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'No database' }, { status: 503 })
  }

  if (action === 'view') {
    const { data: current } = await supabase
      .from('articles')
      .select('view_count')
      .eq('id', id)
      .single()

    const newCount = (current?.view_count || 0) + 1
    await supabase
      .from('articles')
      .update({ view_count: newCount })
      .eq('id', id)

    return NextResponse.json({ view_count: newCount })
  }

  if (action === 'like') {
    const { data: current } = await supabase
      .from('articles')
      .select('like_count')
      .eq('id', id)
      .single()

    const newCount = (current?.like_count || 0) + 1
    await supabase
      .from('articles')
      .update({ like_count: newCount })
      .eq('id', id)

    return NextResponse.json({ like_count: newCount })
  }

  if (action === 'unlike') {
    const { data: current } = await supabase
      .from('articles')
      .select('like_count')
      .eq('id', id)
      .single()

    const newCount = Math.max(0, (current?.like_count || 0) - 1)
    await supabase
      .from('articles')
      .update({ like_count: newCount })
      .eq('id', id)

    return NextResponse.json({ like_count: newCount })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
