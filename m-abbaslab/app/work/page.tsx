import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import WorkClient from './WorkClient'

export const metadata: Metadata = pageMeta({
    title: 'Projects & Case Studies — AFYACONNECT, ILMS, QIS',
    description:
        'Portfolio of 18+ projects by Mohammed Abbas: hackathon-winning systems AFYACONNECT (healthcare), Chuka ILMS (AI education), Quantum Impact Syndicate (research), and client work.',
    keywords: [
        'Mohammed Abbas portfolio',
        'AFYACONNECT',
        'Chuka University ILMS',
        'Quantum Impact Syndicate',
        'hackathon winner Kenya',
        'full-stack projects Africa',
        'Google Cloud AI Labs winner',
        'Gen AI Academy winner',
        'software engineer Kenya portfolio',
    ],
    path: '/work',
})

export default function WorkPage() {
    return <WorkClient />
}
