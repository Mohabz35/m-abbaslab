'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Save } from 'lucide-react'
import type { ConfigArticle } from '@/lib/adminConfigClient'

export type ArticleFormValues = {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  tags: string
  read_time: number
  published: boolean
  featured: boolean
}

type ArticleFormProps = {
  mode: 'create' | 'edit'
  initial?: Partial<ConfigArticle>
  loading?: boolean
  error?: string | null
  onSubmit: (values: ArticleFormValues) => void | Promise<void>
}

const defaultValues: ArticleFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'research',
  tags: '',
  read_time: 5,
  published: true,
  featured: false,
}

export function articleToFormValues(article: Partial<ConfigArticle>): ArticleFormValues {
  return {
    title: article.title ?? '',
    slug: article.slug ?? '',
    excerpt: article.excerpt ?? '',
    content: article.content ?? '',
    category: article.category ?? 'research',
    tags: (article.tags ?? []).join(', '),
    read_time: article.read_time ?? 5,
    published: article.published ?? false,
    featured: article.featured ?? false,
  }
}

export default function ArticleForm({
  mode,
  initial,
  loading,
  error,
  onSubmit,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormValues>(() =>
    initial ? articleToFormValues(initial) : defaultValues,
  )

  useEffect(() => {
    if (initial?.id) setFormData(articleToFormValues(initial))
  }, [initial?.id])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug:
        mode === 'create'
          ? title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)+/g, '')
          : prev.slug,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert tags string to array
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    await onSubmit({ ...formData, tags: tagsArray as any })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="research">Research</option>
              <option value="technology">Technology</option>
              <option value="tutorial">Tutorial</option>
              <option value="fashion-tech">Fashion Tech</option>
              <option value="economics">Economics</option>
              <option value="blog">Blog</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Read time (min)</label>
            <input
              type="number"
              required
              min={1}
              value={formData.read_time}
              onChange={(e) =>
                setFormData({ ...formData, read_time: parseInt(e.target.value, 10) || 5 })
              }
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              className="rounded"
            />
            Published
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="rounded"
            />
            Featured on homepage
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Excerpt</label>
          <textarea
            required
            rows={3}
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Content (Markdown)</label>
          <textarea
            required
            rows={15}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Tags (comma separated)</label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link
          href="/admin/articles"
          className="px-6 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold flex items-center gap-2 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving…' : mode === 'create' ? 'Create article' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
