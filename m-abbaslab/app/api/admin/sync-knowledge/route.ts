import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function authBySecret(request: NextRequest): boolean {
  const header = request.headers.get('x-admin-secret')
  return Boolean(process.env.ADMIN_SECRET && header === process.env.ADMIN_SECRET)
}

export async function POST(request: NextRequest) {
  if (!authBySecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = { projects: 0, articles: 0, fashion: 0, profile: 0 }

    // Sync projects
    const { data: projects } = await supabase.from('projects').select('id, title, description, category, status')
    if (projects) {
      for (const p of projects) {
        await supabase.from('ai_knowledge_base').upsert({
          id: p.id,
          category: 'project',
          topic: p.title,
          content: `${p.title}: ${p.description || 'No description'}. Category: ${p.category || 'General'}. Status: ${p.status || 'Unknown'}`,
          source: 'auto_sync',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        results.projects++
      }
    }

    // Sync articles
    const { data: articles } = await supabase.from('articles').select('id, title, excerpt, content, category, tags')
    if (articles) {
      for (const a of articles) {
        const content = a.content ? a.content.slice(0, 2000) : a.excerpt || 'No content'
        await supabase.from('ai_knowledge_base').upsert({
          id: a.id,
          category: 'article',
          topic: a.title,
          content: `${a.title}: ${content}. Category: ${a.category || 'General'}. Tags: ${(a.tags || []).join(', ')}`,
          source: 'auto_sync',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        results.articles++
      }
    }

    // Sync fashion items
    const { data: fashion } = await supabase.from('fashion_items').select('id, title, collection, category, description')
    if (fashion) {
      for (const f of fashion) {
        await supabase.from('ai_knowledge_base').upsert({
          id: f.id,
          category: 'fashion',
          topic: f.title,
          content: `${f.title}: ${f.description || 'No description'}. Collection: ${f.collection || 'N/A'}. Category: ${f.category || 'N/A'}`,
          source: 'auto_sync',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
        results.fashion++
      }
    }

    // Sync profile info
    await supabase.from('ai_knowledge_base').upsert({
      id: 'profile-mohammed',
      category: 'profile',
      topic: 'Mohammed Abbas Profile',
      content: 'Mohammed Abbas is a Software Engineer, Economist, Statistician, Model, CEO of Royal Icon Events, Founder of Quantum Impact Syndicate. BSc Economics & Statistics at Chuka University. Based in Nairobi, Kenya.',
      source: 'auto_sync',
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' })
    results.profile = 1

    return NextResponse.json({ success: true, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
