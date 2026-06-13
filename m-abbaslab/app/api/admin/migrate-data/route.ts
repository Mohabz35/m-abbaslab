import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { personalConfig } from '@/config/personal'

export async function POST(request: NextRequest) {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const results: Record<string, { inserted: number; errors: string[] }> = {}

  // 1. Migrate Projects
  const projects = (personalConfig as any).projects || []
  results.projects = { inserted: 0, errors: [] }
  for (const p of projects) {
    const row: any = {
      title: p.title,
      description: p.description || p.longDescription || '',
      category: p.category || '',
      status: 'active',
      tech_stack: p.techStack || p.technologies || p.tech_stack || [],
      image_url: p.image || p.image_url || '',
      project_url: p.project_url || p.url || p.live_url || '',
      github_url: p.github || p.github_url || '',
      featured: p.featured || false,
    }
    const { error } = await supabase.from('projects').upsert(row, { onConflict: 'id', ignoreDuplicates: false })
    if (error) results.projects.errors.push(`${p.title}: ${error.message}`)
    else results.projects.inserted++
  }

  // 2. Migrate Articles
  const articles = (personalConfig as any).articles || []
  results.articles = { inserted: 0, errors: [] }
  for (const a of articles) {
    const row: any = {
      title: a.title,
      excerpt: a.excerpt || '',
      content: a.content || '',
      category: a.category || '',
      tags: a.tags || [],
      image_url: a.image || a.image_url || '',
      author: a.author || personalConfig.name,
      read_time: a.readTime || a.read_time || 5,
      status: 'published',
      published_at: a.date || a.publishDate ? new Date(a.date || a.publishDate).toISOString() : new Date().toISOString(),
    }
    const { error } = await supabase.from('articles').upsert(row, { onConflict: 'id', ignoreDuplicates: false })
    if (error) results.articles.errors.push(`${a.title}: ${error.message}`)
    else results.articles.inserted++
  }

  // 3. Migrate Fashion
  const fashionTitles = (personalConfig as any).fashion?.titles || []
  results.fashion = { inserted: 0, errors: [] }
  for (const t of fashionTitles) {
    const { error } = await supabase.from('fashion_items').upsert(
      { title: t.title || t.name || 'Fashion Item', collection: t.collection || '', category: t.category || '', status: t.status || 'design', stock: t.stock || 0, image_url: t.image || '', price: t.price || 0 },
      { onConflict: 'id', ignoreDuplicates: false }
    )
    if (error) results.fashion.errors.push(`${t.title}: ${error.message}`)
    else results.fashion.inserted++
  }

  // 4. Set site_config
  const configEntries = [
    { key: 'site_info', value: { name: personalConfig.name, email: personalConfig.email, brandName: personalConfig.brandName, title: personalConfig.title, tagline: personalConfig.tagline, googleAnalyticsId: personalConfig.googleAnalyticsId, roles: personalConfig.roles, researchInterests: personalConfig.researchInterests } },
    { key: 'social_links', value: personalConfig.social || {} },
    { key: 'site_features', value: (personalConfig as any).site?.features || {} },
  ]
  results.config = { inserted: 0, errors: [] }
  for (const entry of configEntries) {
    const { error } = await supabase.from('site_config').upsert(
      { key: entry.key, value: entry.value },
      { onConflict: 'key', ignoreDuplicates: false }
    )
    if (error) results.config.errors.push(`${entry.key}: ${error.message}`)
    else results.config.inserted++
  }

  return NextResponse.json({ success: true, results })
}
