import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import AbbasAiClient from './AbbasAiClient'

export const metadata: Metadata = pageMeta({
    title: 'M-Abbas AI — Personal AI Assistant',
    description:
        'M-Abbas AI: the personal AI assistant and digital intelligence of Mohammed Abbas, answering questions about his work, research, and initiatives.',
    keywords: [
        'M-Abbas AI',
        'personal AI assistant Kenya',
        'AI chat portfolio',
        'Mohammed Abbas AI',
    ],
    path: '/work/m-abbas-ai',
})

export default function AbbasAiPage() {
    return <AbbasAiClient />
}
