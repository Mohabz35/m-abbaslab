import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import ContactClient from './ContactClient'

export const metadata: Metadata = pageMeta({
    title: 'Contact & Bookings — Mohammed Abbas',
    description:
        'Get in touch with Mohammed Abbas: collaboration, consulting, speaking, modeling bookings, and partnerships. Quick chat, email, or WhatsApp.',
    keywords: [
        'contact Mohammed Abbas',
        'book model Kenya',
        'tech consulting Kenya',
        'speaking engagement Kenya',
        'collaboration inquiry',
    ],
    path: '/contact',
})

export default function ContactPage() {
    return <ContactClient />
}
