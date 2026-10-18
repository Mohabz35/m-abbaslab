import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import ArticlesClient from './ArticlesClient'

export const metadata: Metadata = pageMeta({
    title: 'Articles — Economics, Statistics & Technology',
    description:
        'Articles by Mohammed Abbas on economics, econometrics, statistics, data science, machine learning, and software engineering — with books on ILMS, SkillSync, and economic forecasting.',
    keywords: [
        'economics articles Kenya',
        'statistics articles',
        'data science blog',
        'machine learning tutorials',
        'econometrics explained',
        'tech articles Africa',
        'Mohammed Abbas writer',
        'Chuka University research',
    ],
    path: '/articles',
})

export default function ArticlesPage() {
    return <ArticlesClient />
}
