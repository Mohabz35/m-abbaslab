'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import ArticleForm, { type ArticleFormValues } from '@/components/admin/ArticleForm'
import { useAdminConfig } from '@/hooks/useAdminConfig'
import { buildArticleFromForm, type ConfigArticle } from '@/lib/adminConfigClient'

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { config, loading, saving, error, updateConfig } = useAdminConfig()
  const [formError, setFormError] = useState<string | null>(null)

  const article = useMemo(() => {
    const list = (config?.articles ?? []) as ConfigArticle[]
    return list.find((a) => a.id === id)
  }, [config?.articles, id])

  const handleSubmit = async (values: ArticleFormValues) => {
    if (!article) return
    setFormError(null)

    const updated = buildArticleFromForm(
      {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        category: values.category,
        read_time: values.read_time,
        tags: values.tags,
        published: values.published,
        featured: values.featured,
        id: article.id,
      },
      article,
    )

    const ok = await updateConfig((c) => ({
      ...c,
      articles: ((c.articles as ConfigArticle[]) ?? []).map((a) =>
        a.id === id ? updated : a,
      ) as typeof c.articles,
    }))

    if (ok) {
      router.push('/admin/articles')
    } else {
      setFormError('Save failed. Sign in again if your session expired.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading article…
      </div>
    )
  }

  if (!article) {
    return (
      <div className="space-y-4">
        <p className="text-red-500">Article not found.</p>
        <Link href="/admin/articles" className="text-blue-600 text-sm">
          Back to articles
        </Link>
      </div>
    )
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit article</h1>
        <p className="text-sm text-gray-500 mt-1 font-mono">{article.id}</p>
      </header>

      <ArticleForm
        mode="edit"
        initial={article}
        loading={saving}
        error={formError || error}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
