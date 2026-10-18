import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import AdvocacyClient from './AdvocacyClient'

export const metadata: Metadata = pageMeta({
    title: 'Advocacy — Human Empowerment & Youth Leadership',
    description:
        "Mohammed Abbas's advocacy pillars: human empowerment, good governance, youth leadership across Kenya's 47 counties, saving the boychild, women empowerment, and community health.",
    keywords: [
        'youth empowerment Kenya',
        'human empowerment Africa',
        'good governance Kenya',
        'Man of Africa initiative',
        'boychild advocacy',
        'youth leadership Africa',
        'NGO Kenya',
        'community health Kenya',
        'Mohammed Abbas advocate',
    ],
    path: '/advocacy',
})

export default function AdvocacyPage() {
    return <AdvocacyClient />
}
