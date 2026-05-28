import { NextResponse } from 'next/server'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { personalConfig } from '@/config/personal'

export async function POST() {
  if (!hasSupabaseKeys) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const results = {
    projectsAdded: 0,
    projectsFailed: 0,
    articlesAdded: 0,
    articlesFailed: 0,
    logs: [] as string[]
  }

  // Migrate Projects
  const projects = personalConfig.projects || []
  for (const p of (projects as any[])) {
    try {
      const { error } = await supabase.from('projects').insert({
        title: p.title || 'Untitled Project',
        description: p.description || p.longDescription || '',
        category: p.category || 'General',
        status: p.status || 'planning',
        milestones: p.milestones || [],
        contributors: p.contributors || [],
        file_uploads: p.file_uploads || []
      })
      if (error) {
        results.logs.push(`Project "${p.title}" error: ${error.message}`)
        results.projectsFailed++
      } else {
        results.projectsAdded++
      }
    } catch (e: any) {
      results.logs.push(`Project "${p.title}" exception: ${e.message}`)
      results.projectsFailed++
    }
  }

  // Migrate Articles
  const articles = personalConfig.articles || []
  for (const a of articles) {
    try {
      const { error } = await supabase.from('articles').insert({
        title: a.title || 'Untitled Article',
        slug: a.slug || a.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `article-${Date.now()}`,
        excerpt: a.excerpt || '',
        content: a.content || '',
        category: a.category || 'research',
        tags: a.tags || [],
        read_time: a.read_time || 5,
        published: a.published !== false,
        featured: a.featured || false
      })
      if (error) {
        // If it's a unique constraint error on slug, try appending random string
        if (error.code === '23505') {
            const fallbackSlug = `${a.slug || 'article'}-${Math.random().toString(36).substring(2, 7)}`
            const { error: retryError } = await supabase.from('articles').insert({
                title: a.title || 'Untitled Article',
                slug: fallbackSlug,
                excerpt: a.excerpt || '',
                content: a.content || '',
                category: a.category || 'research',
                tags: a.tags || [],
                read_time: a.read_time || 5,
                published: a.published !== false,
                featured: a.featured || false
            })
            if (retryError) {
                results.logs.push(`Article "${a.title}" retry error: ${retryError.message}`)
                results.articlesFailed++
            } else {
                results.logs.push(`Article "${a.title}" added with fallback slug: ${fallbackSlug}`)
                results.articlesAdded++
            }
        } else {
            results.logs.push(`Article "${a.title}" error: ${error.message}`)
            results.articlesFailed++
        }
      } else {
        results.articlesAdded++
      }
    } catch (e: any) {
      results.logs.push(`Article "${a.title}" exception: ${e.message}`)
      results.articlesFailed++
    }
  }

  return NextResponse.json({
    success: true,
    message: `Migration complete. Added ${results.projectsAdded} projects and ${results.articlesAdded} articles.`,
    results
  })
}
