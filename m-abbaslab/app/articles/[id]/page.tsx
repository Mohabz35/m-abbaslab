import type { Metadata } from 'next'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { pageMeta } from '@/lib/seo'
import ArticleDetailClient from './ArticleDetailClient'

async function getArticle(id: string): Promise<any | null> {
    if (!hasSupabaseKeys) return null
    try {
        const { data, error } = await supabase
            .from('articles')
            .select('id, slug, title, excerpt, content, category, tags, seo_title, seo_description, seo_keywords, cover_image, image_url, published, status')
            .or(`id.eq.${id},slug.eq.${id}`)
            .single()
        if (error || !data) return null
        if (data.status !== 'published' && data.published !== true) return null
        return data
    } catch {
        return null
    }
}

function buildMetadata(article: any, id: string): Metadata {
    if (!article) {
        return pageMeta({
            title: 'Article',
            description: 'Article by Mohammed Abbas on economics, statistics, data science, and technology.',
            path: `/articles/${id}`,
        })
    }
    const excerpt = article.excerpt || (article.content || '').slice(0, 160)
    return pageMeta({
        title: article.seo_title || article.title,
        description: article.seo_description || excerpt,
        keywords: article.seo_keywords
            ? String(article.seo_keywords).split(',').map((k: string) => k.trim()).filter(Boolean)
            : [article.category, 'Mohammed Abbas', 'article', ...(Array.isArray(article.tags) ? article.tags : [])].filter(Boolean),
        path: `/articles/${article.id}`,
        image: article.og_image || article.cover_image || article.image_url || undefined,
        type: 'article',
    })
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const article = await getArticle(id)
    return buildMetadata(article, id)
}

export default async function ArticlePage() {
    return <ArticleDetailClient />
}
