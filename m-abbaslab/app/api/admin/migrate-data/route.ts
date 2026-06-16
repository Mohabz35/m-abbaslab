import { NextRequest, NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { personalConfig } from '@/config/personal'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

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
    const baseSlug = slugify(a.title || a.slug || 'article')
    let slug = baseSlug
    let counter = 1
    while (true) {
      const { data: existing } = await supabase.from('articles').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      slug = `${baseSlug}-${counter++}`
    }
    const row: any = {
      title: a.title,
      slug,
      excerpt: a.excerpt || '',
      content: a.content || '',
      category: a.category || '',
      tags: a.tags || [],
      image_url: a.image || a.image_url || '',
      author: a.author || personalConfig.name,
      read_time: a.readTime || a.read_time || 5,
      status: a.published ? 'published' : 'draft',
      published_at: a.date || a.publishDate || a.published_at ? new Date(a.date || a.publishDate || a.published_at).toISOString() : null,
    }
    const { error } = await supabase.from('articles').upsert(row, { onConflict: 'id', ignoreDuplicates: false })
    if (error) results.articles.errors.push(`${a.title}: ${error.message}`)
    else results.articles.inserted++
  }

  // 3. Migrate Fashion - clean and re-insert
  const fashionTitles = (personalConfig as any).fashion?.titles || []
  results.fashion = { inserted: 0, errors: [] }
  
  // Clear existing fashion items first
  await supabase.from('fashion_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  for (const t of fashionTitles) {
    const title = t.title || t.name || 'Fashion Item'
    const row = {
      title,
      collection: t.collection || '',
      category: t.category || t.achievement || '',
      status: t.status || 'design',
      stock: t.stock || 0,
      image_url: t.image || '',
      price: t.price || 0,
      size: t.size || null,
      description: t.description || '',
      event_date: t.year ? new Date(`${t.year}-01-01`).toISOString().split('T')[0] : null,
      location: t.location || '',
      tags: t.category ? [t.category] : [],
      gallery_images: t.image ? [t.image] : [],
    }
    const { error } = await supabase.from('fashion_items').insert([row])
    if (error) results.fashion.errors.push(`${title}: ${error.message}`)
    else results.fashion.inserted++
  }

  // 5. Migrate Runway Journey
  const runwayJourney = (personalConfig as any).runwayJourney || []
  results.runwayJourney = { inserted: 0, errors: [] }
  await supabase.from('runway_journey').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  for (const r of runwayJourney) {
    const row = {
      year: r.year,
      title: r.title,
      description: r.description || '',
      highlights: r.highlights || [],
      featured: r.featured || false,
      image_url: r.image || '',
      category: r.category || 'milestone',
      display_order: 0,
    }
    const { error } = await supabase.from('runway_journey').insert([row])
    if (error) results.runwayJourney.errors.push(`${r.title}: ${error.message}`)
    else results.runwayJourney.inserted++
  }

  // 4. Set site_config - with error handling
  const configEntries = [
    { key: 'site_info', value: { name: personalConfig.name, email: personalConfig.email, brandName: personalConfig.brandName, title: personalConfig.title, tagline: personalConfig.tagline, googleAnalyticsId: personalConfig.googleAnalyticsId, roles: personalConfig.roles, researchInterests: personalConfig.researchInterests } },
    { key: 'social_links', value: personalConfig.social || {} },
    { key: 'site_features', value: (personalConfig as any).site?.features || {} },
  ]
  results.config = { inserted: 0, errors: [] }
  for (const entry of configEntries) {
    try {
      const { error } = await supabase.from('site_config').upsert(
        { key: entry.key, value: entry.value },
        { onConflict: 'key', ignoreDuplicates: false }
      )
      if (error) results.config.errors.push(`${entry.key}: ${error.message}`)
      else results.config.inserted++
    } catch (e: any) {
      results.config.errors.push(`${entry.key}: ${e.message}`)
    }
  }

  return NextResponse.json({ success: true, results })
}
