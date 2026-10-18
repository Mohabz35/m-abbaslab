import type { Metadata } from 'next'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { pageMeta } from '@/lib/seo'
import ProjectDetailClient from './ProjectDetailClient'

async function getProject(id: string): Promise<any | null> {
    if (!hasSupabaseKeys) return null
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('id, title, description, category, tech_stack, image_url')
            .eq('id', id)
            .single()
        if (error || !data) return null
        return data
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const project = await getProject(id)
    if (!project) {
        return pageMeta({
            title: 'Project',
            description: 'Project case study by Mohammed Abbas.',
            path: `/work/${id}`,
        })
    }
    return pageMeta({
        title: project.title,
        description: project.description || `${project.title} — project by Mohammed Abbas.`,
        keywords: [
            project.title,
            project.category,
            'Mohammed Abbas project',
            'M-AbbasLab',
            ...(Array.isArray(project.tech_stack) ? project.tech_stack : []),
        ].filter(Boolean),
        path: `/work/${project.id}`,
        image: project.image_url || undefined,
    })
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    return <ProjectDetailClient />
}
