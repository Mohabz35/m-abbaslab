import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import CvGeneratorClient from './CvGeneratorClient'

export const metadata: Metadata = pageMeta({
    title: 'Free AI CV Generator — Build a Professional Resume',
    description:
        'Generate a professional CV in minutes with AI. Free resume builder by M-AbbasLab with templates, live preview, and PDF export.',
    keywords: [
        'free CV generator',
        'AI resume builder',
        'Kenya CV maker',
        'online resume builder free',
        'PDF CV generator',
        'student resume Kenya',
    ],
    path: '/cv-generator',
})

export default function CvGeneratorPage() {
    return <CvGeneratorClient />
}
