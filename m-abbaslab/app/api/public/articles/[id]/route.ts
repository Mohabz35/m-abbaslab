import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params

    if (hasSupabaseKeys) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && data && (data.status === 'published' || data.published === true)) {
        return NextResponse.json(data)
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch {
    return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
  }
}
