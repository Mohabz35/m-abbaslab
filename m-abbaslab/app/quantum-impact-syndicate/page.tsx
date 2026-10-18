import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import QisLandingClient from './QisLandingClient'

export const metadata: Metadata = pageMeta({
    title: 'Quantum Impact Syndicate — Research & Strategy Collective',
    description:
        'Quantum Impact Syndicate (QIS): an elite research collective building AI-powered economic, statistical, and technology solutions for Africa.',
    keywords: [
        'Quantum Impact Syndicate',
        'QIS Kenya',
        'research collective Africa',
        'AI research Kenya',
        'economic modeling collective',
        'data science syndicate',
    ],
    path: '/quantum-impact-syndicate',
})

export default function QisLandingPage() {
    return <QisLandingClient />
}
