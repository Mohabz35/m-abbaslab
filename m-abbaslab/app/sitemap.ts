import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://m-abbaslab.com'

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/work`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/fashion`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/fashion/gallery`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/cv-generator`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/quantum-impact-syndicate`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/work/academic/ilms`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/work/academic/skillsync`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/work/academic/economics`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/advocacy`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/initiatives`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ]
}
