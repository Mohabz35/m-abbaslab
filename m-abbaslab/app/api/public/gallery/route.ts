import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export async function GET() {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 })
  }

  try {
    const { data, error } = await supabase
      .from('fashion_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const categories = new Set(data.map((item: any) => item.collection || item.category).filter(Boolean))
    const gallery = {
      categories: Array.from(categories).map(cat => ({
        id: cat,
        name: cat,
        count: data.filter(item => (item.collection || item.category) === cat).length
      })),
      items: data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.collection || item.category,
        image: item.image_url || '',
        location: item.location || '',
        eventDate: item.event_date || '',
        tags: item.tags || [],
        achievement: item.tags?.find((t: string) => ['Winner', 'Finalist', 'Featured', 'Published'].includes(t)) || '',
      })),
    }

    return NextResponse.json({ success: true, gallery })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
