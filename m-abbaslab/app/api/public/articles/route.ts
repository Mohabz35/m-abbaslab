import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET() {
  if (!hasSupabaseKeys) {
    return NextResponse.json([], { status: 500 })
  }

  const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json([], { status: 500 })
  }

  const articles = (data || []).filter((a: any) => a.status === 'published' || a.published === true)
  return NextResponse.json(articles)
}

