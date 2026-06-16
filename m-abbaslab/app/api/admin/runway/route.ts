import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('runway_journey').select('*').order('year', { ascending: false })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, items: data })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { data, error } = await supabase.from('runway_journey').insert([{
      year: body.year,
      title: body.title,
      description: body.description,
      highlights: body.highlights || [],
      featured: body.featured || false,
      image_url: body.image_url || '',
      category: body.category || 'Collection',
      display_order: body.display_order || 0,
    }]).select()
    if (error) throw error
    return NextResponse.json({ success: true, item: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, ...updates } = body
    const { data, error } = await supabase.from('runway_journey').update(updates).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ success: true, item: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    const { error } = await supabase.from('runway_journey').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
