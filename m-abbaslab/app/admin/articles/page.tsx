'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FileText,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { useAdminConfig } from '@/hooks/useAdminConfig'
import type { ConfigArticle } from '@/lib/adminConfigClient'

type ArticleStatus = 'published' | 'draft'

type ListArticle = ConfigArticle & { status: ArticleStatus }

export default function AdminArticlesPage() {
  const { config, loading, saving, error, successMessage, updateConfig, clearMessages } =
    useAdminConfig()
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'drafts'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  const articles: ListArticle[] = useMemo(() => {
    const list = (config?.articles ?? []) as ConfigArticle[]
    return list.map((a) => ({
      ...a,
      status: a.published ? ('published' as const) : ('draft' as const),
    }))
  }, [config?.articles])

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (activeTab === 'all') return matchesSearch
    return matchesSearch && article.status === activeTab
  })

  const persistArticles = async (nextArticles: ConfigArticle[]) => {
    setActionError(null)
    clearMessages()
    const ok = await updateConfig((c) => ({
      ...c,
      articles: nextArticles as typeof c.articles,
    }))
    if (!ok) setActionError('Could not save. Check you are logged in.')
    return ok
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return
    const next = articles.filter((a) => a.id !== id)
    await persistArticles(next)
  }

  const handleTogglePublished = async (id: string) => {
    const next = articles.map((a) =>
      a.id === id
        ? {
            ...a,
            published: !a.published,
            published_at: a.published ? a.published_at : new Date().toISOString(),
          }
        : a,
    )
    await persistArticles(next)
  }

  const isBusy = loading || saving

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Articles</h1>
          <p className="text-sm text-gray-400 dark:text-gray-400 mt-1">
            Create, edit, and publish. Saves to your live config (Supabase or project files).
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New article
        </Link>
      </header>

      {(error || actionError) && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {actionError || error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
        <div className="flex flex-wrap gap-2">
          {(['all', 'published', 'drafts'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && ` (${articles.length})`}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search articles…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading articles…
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
          <FileText className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-400">No articles match your filters.</p>
          <Link href="/admin/articles/new" className="text-blue-600 text-sm mt-2 inline-block">
            Create your first article
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredArticles.map((article) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg shrink-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {article.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-400">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {article.status}
                    </span>
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>
                      {article.published_at
                        ? new Date(article.published_at).toLocaleDateString()
                        : 'No date'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {article.published && (
                  <Link
                    href={`/articles/${article.id}`}
                    target="_blank"
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    title="View on site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleTogglePublished(article.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg disabled:opacity-50"
                  title={article.published ? 'Unpublish' : 'Publish'}
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <Link
                  href={`/admin/articles/edit/${article.id}`}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleDelete(article.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
