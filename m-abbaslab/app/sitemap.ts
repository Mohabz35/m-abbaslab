import { MetadataRoute } from 'next'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const baseUrl = 'https://www.mohammedabbas.tech'

const ilmsChapters = [
    'System Context, Vision, and Scope',
    'Background Systems and Architectural Foundations',
    'Core System Architecture and Data Models',
    'System Workflows and User Journeys',
    'Assessment, Grading, and Evaluation',
    'Attendance and Engagement Analytics',
    'Skill DNA Intelligence and Analytics',
    'System Evaluation and Scalability',
    'Sample Data and Walkthrough',
    'Prototype and Functional Blueprint',
    'MVP and AI System Clarification',
    'Costing, Tooling, and Revenue Model',
    'Examination and Question Engine',
    'Security, Compliance, and Data Protection',
    'Implementation Plan and Tech Stack',
]

const skillsyncChapters = [
    'Academic Analysis & Validation',
    'Mathematical Models & Equations',
    'System Documentation & Architecture',
    'The Evolution Engine (Prompt Guide)',
]

const economicsChapters = [
    'Introduction & Background',
    'System Overview & Architecture',
    'Data Pipeline Implementation',
    'ML Model Design (LSTM/GRU)',
    'Statistical Validation',
    'Model Versioning & MLOps',
    'Real-Time Inference API',
    'Cloud-Native Deployment',
    'Interactive Visualization & Analytics',
    'Security, Ethics & Limitations',
    'Conclusion & Future Work',
]

function staticEntry(path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number): MetadataRoute.Sitemap[number] {
    return {
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }
}

function chapterEntries(base: string, chapters: string[]): MetadataRoute.Sitemap {
    return chapters.map((_, i) => ({
        url: `${baseUrl}${base}/chapter-${i + 1}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }))
}

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    const pages: MetadataRoute.Sitemap = [
        staticEntry('/', 'weekly', 1),
        staticEntry('/about', 'monthly', 0.9),
        staticEntry('/work', 'weekly', 0.9),
        staticEntry('/articles', 'weekly', 0.9),
        staticEntry('/fashion', 'weekly', 0.8),
        staticEntry('/fashion/gallery', 'weekly', 0.7),
        staticEntry('/advocacy', 'weekly', 0.9),
        staticEntry('/initiatives', 'weekly', 0.9),
        staticEntry('/kipawa-afrika', 'monthly', 0.7),
        staticEntry('/quantum-impact-syndicate', 'monthly', 0.6),
        staticEntry('/cv-generator', 'monthly', 0.6),
        staticEntry('/contact', 'yearly', 0.5),
        staticEntry('/work/m-abbas-ai', 'monthly', 0.7),

        // Academic book hubs
        staticEntry('/work/academic/ilms', 'monthly', 0.7),
        staticEntry('/work/academic/skillsync', 'monthly', 0.7),
        staticEntry('/work/academic/economics', 'monthly', 0.7),

        // Academic chapters (subtopics)
        ...chapterEntries('/work/academic/ilms', ilmsChapters),
        ...chapterEntries('/work/academic/skillsync', skillsyncChapters),
        ...chapterEntries('/work/academic/economics', economicsChapters),
    ]

    // Dynamic content from Supabase (articles + projects)
    if (hasSupabaseKeys) {
        try {
            const [articlesRes, projectsRes] = await Promise.all([
                supabase.from('articles').select('id, slug, status, published, updated_at, published_at, created_at'),
                supabase.from('projects').select('id, title, updated_at, created_at'),
            ])

            if (!articlesRes.error && articlesRes.data) {
                const published = articlesRes.data.filter(
                    (a: any) => a.status === 'published' || a.published === true
                )
                for (const a of published) {
                    pages.push({
                        url: `${baseUrl}/articles/${a.id}`,
                        lastModified: new Date(a.updated_at || a.published_at || a.created_at || now),
                        changeFrequency: 'monthly',
                        priority: 0.7,
                    })
                    if (a.slug) {
                        pages.push({
                            url: `${baseUrl}/articles/${a.slug}`,
                            lastModified: new Date(a.updated_at || a.published_at || a.created_at || now),
                            changeFrequency: 'monthly',
                            priority: 0.6,
                        })
                    }
                }
            }

            if (!projectsRes.error && projectsRes.data) {
                for (const p of projectsRes.data) {
                    pages.push({
                        url: `${baseUrl}/work/${p.id}`,
                        lastModified: new Date(p.updated_at || p.created_at || now),
                        changeFrequency: 'monthly',
                        priority: 0.6,
                    })
                }
            }
        } catch (e) {
            console.error('sitemap: failed to fetch dynamic content', e)
        }
    }

    return pages
}
