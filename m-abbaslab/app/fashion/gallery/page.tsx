import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import GalleryClient from './GalleryClient'

export const metadata: Metadata = pageMeta({
    title: 'Modeling Gallery — Runway & Editorial Photos',
    description:
        'Photo gallery of Mohammed Abbas: runway shows, editorial shoots, pageantry finals, and brand campaigns across Kenya.',
    keywords: [
        'Kenya model photos',
        'runway photography Kenya',
        'male model gallery',
        'pageantry photos Kenya',
        'editorial modeling Africa',
        'Mohammed Abbas gallery',
    ],
    path: '/fashion/gallery',
})

export default function GalleryPage() {
    return <GalleryClient />
}
