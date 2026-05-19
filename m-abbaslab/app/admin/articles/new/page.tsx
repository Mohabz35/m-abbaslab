'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ArticleForm, { type ArticleFormValues } from '@/components/admin/ArticleForm'
import { useAdminConfig } from '@/hooks/useAdminConfig'
import { buildArticleFromForm, type ConfigArticle } from '@/lib/adminConfigClient'

export default function NewArticlePage() {
  const router = useRouter()
  const { saving, error, updateConfig } = useAdminConfig()
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (values: ArticleFormValues) => {
    setFormError(null)
    const newArticle = buildArticleFromForm({
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      category: values.category,
      read_time: values.read_time,
      tags: values.tags,
      published: values.published,
      featured: values.featured,
    })

    const ok = await updateConfig((c) => ({
      ...c,
      articles: [newArticle, ...((c.articles as ConfigArticle[]) ?? [])] as typeof c.articles,
    }))

    if (ok) {
      router.push('/admin/articles')
    } else {
      setFormError('Save failed. Sign in again if your session expired.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/articles"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to articles
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New article</h1>
        <p className="text-sm text-gray-500 mt-1">Saves to your live site config.</p>
      </header>

      <ArticleForm
        mode="create"
        loading={saving}
        error={formError || error}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
