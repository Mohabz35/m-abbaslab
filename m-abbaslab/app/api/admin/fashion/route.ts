import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { supabase } from '@/lib/supabase'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ''
)

async function isAuthorized(request: NextRequest): Promise<boolean> {
  const header = request.headers.get('x-admin-secret')
  if (process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET) return true
  const session = request.cookies.get('admin_session')
  if (!session?.value) return false
  try {
    await jwtVerify(session.value, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const collection = searchParams.get('collection')
  const status = searchParams.get('status')

  let query = supabase.from('fashion_items').select('*').order('created_at', { ascending: false })
  if (collection && collection !== 'all') query = query.eq('collection', collection)
  if (status && status !== 'all') query = query.eq('status', status)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, items: data })
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { data, error } = await supabase.from('fashion_items').insert([{
      title: body.title,
      collection: body.collection,
      category: body.category,
      status: body.status || 'design',
      size: body.size,
      stock: body.stock || 0,
      price: body.price || 0,
      image_url: body.image_url || '',
      gallery_images: body.gallery_images || [],
      description: body.description || '',
      location: body.location || '',
      event_date: body.event_date || null,
      tags: body.tags || [],
    }]).select()
    if (error) throw error
    return NextResponse.json({ success: true, item: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...updates } = body
    const { data, error } = await supabase.from('fashion_items').update(updates).eq('id', id).select()
    if (error) throw error
    return NextResponse.json({ success: true, item: data[0] })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 })
    
    const { error } = await supabase.from('fashion_items').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
