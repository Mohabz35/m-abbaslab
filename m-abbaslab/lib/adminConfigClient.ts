import { personalConfig } from '@/config/personal'

export type SiteConfig = typeof personalConfig

/** Article shape stored in personalConfig.articles */
export type ConfigArticle = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  read_time: number
  published: boolean
  published_at?: string
  tags?: string[]
  featured?: boolean
}

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch('/api/admin/config', { cache: 'no-store' })
    if (res.ok) {
      return (await res.json()) as SiteConfig
    }
  } catch {
    // fall through
  }
  return personalConfig as SiteConfig
}

export async function saveSiteConfig(config: SiteConfig): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch('/api/admin/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })

  if (!res.ok) {
    let message = 'Failed to save configuration'
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* ignore */
    }
    return { ok: false, message }
  }

  try {
    const data = await res.json()
    return { ok: true, message: data?.message }
  } catch {
    return { ok: true }
  }
}

export function buildArticleFromForm(
  input: {
    title: string
    slug: string
    excerpt: string
    content: string
    category: string
    read_time: number
    tags: string
    published?: boolean
    featured?: boolean
    id?: string
  },
  existing?: ConfigArticle,
): ConfigArticle {
  const slug = input.slug || slugifyTitle(input.title)
  const tagsArray = input.tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const published = input.published ?? true
  const nowIso = new Date().toISOString()

  return {
    id: existing?.id ?? input.id ?? slug ?? `article-${Date.now()}`,
    title: input.title,
    slug,
    excerpt: input.excerpt,
    content: input.content,
    category: input.category,
    read_time: input.read_time,
    published,
    published_at:
      published
        ? existing?.published_at ?? nowIso
        : existing?.published_at,
    tags: tagsArray,
    featured: input.featured ?? existing?.featured ?? false,
  }
}
