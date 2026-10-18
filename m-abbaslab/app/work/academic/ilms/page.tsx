import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import IlmsBookClient from './IlmsBookClient'

export const metadata: Metadata = pageMeta({
    title: 'ILMS — Intelligent Learning Management System (Academic Blueprint)',
    description:
        '15-chapter academic blueprint for an AI-powered Learning Management System: system architecture, Skill DNA analytics, assessment engines, examination systems, security, costing, and implementation plan.',
    keywords: [
        'ILMS',
        'intelligent learning management system',
        'AI LMS Kenya',
        'Skill DNA analytics',
        'education technology Africa',
        'assessment grading system',
        'Chuka University project',
        'LMS architecture',
        'e-learning platform Kenya',
    ],
    path: '/work/academic/ilms',
})

export default function IlmsBookPage() {
    return <IlmsBookClient />
}
