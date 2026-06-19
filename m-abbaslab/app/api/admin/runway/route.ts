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
  const { data, error } = await supabase.from('runway_journey').select('*').order('year', { ascending: false })
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true, items: data })
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
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

export async function PUT(request: NextRequest) {
  try {
    if (!(await isAuthorized(request as any))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { id, ...updates } = body
    const { data, error } = await supabase.from('runway_journey').update(updates).eq('id', id).select()
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
    const { error } = await supabase.from('runway_journey').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
