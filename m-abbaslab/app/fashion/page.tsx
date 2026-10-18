import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import FashionClient from './FashionClient'

export const metadata: Metadata = pageMeta({
    title: 'Fashion & Modeling Portfolio — Mohammed Abbas',
    description:
        'Fashion and modeling portfolio of Mohammed Abbas: Man of Africa Finalist, Chuka University Model Leader & 1st Prince, Mr Face of Kitui, runway timeline, brand collaborations, and booking.',
    keywords: [
        'Mohammed Abbas model Kenya',
        'Man of Africa Kenya',
        'Mr Face of Kitui',
        'Chuka University model',
        'Kenyan male models',
        'runway model Kenya',
        'pageantry Kenya',
        'Royal Icon Events',
        'male model portfolio Kenya',
    ],
    path: '/fashion',
})

export default function FashionPage() {
    return <FashionClient />
}
