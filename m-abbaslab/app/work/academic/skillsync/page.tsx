import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import SkillSyncBookClient from './SkillSyncBookClient'

export const metadata: Metadata = pageMeta({
    title: 'SkillSync — Skills Validation Platform (Academic Blueprint)',
    description:
        'Academic documentation for SkillSync: mathematical models, academic validation, system architecture, and the Evolution Engine prompt guide for skills matching.',
    keywords: [
        'SkillSync',
        'skills validation platform',
        'skills matching engine',
        'education technology Kenya',
        'academic analysis validation',
        'mathematical models education',
    ],
    path: '/work/academic/skillsync',
})

export default function SkillSyncBookPage() {
    return <SkillSyncBookClient />
}
