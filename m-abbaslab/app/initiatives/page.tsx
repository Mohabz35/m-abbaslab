import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import InitiativesClient from './InitiativesClient'

export const metadata: Metadata = pageMeta({
    title: 'Initiatives — Royal Icon, QIS & Digital Empowerment',
    description:
        'Projects and initiatives founded by Mohammed Abbas: Royal Icon talent platform, Quantum Impact Syndicate research collective, AFYACONNECT healthcare, and Chuka University ILMS.',
    keywords: [
        'Royal Icon Kenya',
        'Quantum Impact Syndicate',
        'AFYACONNECT',
        'Chuka University ILMS',
        'digital empowerment Kenya',
        'talent discovery Africa',
        'youth unemployment Kenya',
        'AI ecosystem Kenya',
        'Mohammed Abbas initiatives',
    ],
    path: '/initiatives',
})

export default function InitiativesPage() {
    return <InitiativesClient />
}
