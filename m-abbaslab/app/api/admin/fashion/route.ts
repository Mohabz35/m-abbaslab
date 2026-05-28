import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('fashion_items').select('*').order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, items: data })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { data, error } = await supabase.from('fashion_items').insert([{
      title: body.title,
      collection: body.collection,
      status: body.status || 'design',
      stock: body.stock || 0
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
    const { data, error } = await supabase.from('fashion_items').update(updates).eq('id', id).select()
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
    
    const { error } = await supabase.from('fashion_items').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
