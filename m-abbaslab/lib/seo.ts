import type { Metadata } from 'next'

const SITE_URL = 'https://www.mohammedabbas.tech'

export function pageMeta(opts: {
    title: string
    description: string
    keywords?: string[]
    path: string
    image?: string
    type?: 'website' | 'article'
}): Metadata {
    const url = `${SITE_URL}${opts.path}`
    const image = opts.image || '/og-image.jpg'
    const fullTitle = `${opts.title} | M-AbbasLab`

    return {
        title: opts.title,
        description: opts.description,
        keywords: opts.keywords,
        alternates: { canonical: opts.path },
        openGraph: {
            type: opts.type || 'website',
            locale: 'en_US',
            url,
            title: fullTitle,
            description: opts.description,
            siteName: 'M-AbbasLab',
            images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: opts.description,
            creator: '@mohammedabbasKE',
            images: [image],
        },
    }
}
