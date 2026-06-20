'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  FileText, Edit, Trash2, Plus, Eye, Clock, BarChart3,
  Calendar, Tag, Search, Filter, Star, TrendingUp, Send
} from 'lucide-react'

type Article = {
  id: string
  title: string
  excerpt: string | null
  category: string
  status: string
  published: boolean
  image_url: string | null
  cover_image: string | null
  read_time: string | null
  seo_title: string | null
  seo_description: string | null
  seo_keywords: string[]
  scheduled_at: string | null
  published_at: string | null
  view_count: number
  like_count: number
  reading_time_min: number | null
  tags: string[]
  created_at: string
}

const categories = ['Economics', 'Statistics', 'Technology', 'Research', 'Problem Solving', 'Complex Concepts', 'Personal']
const statusColors: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-amber-100 text-amber-700',
  archived: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
}

export default function ArticlesEnhancedManager() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showSEOForm, setShowSEOForm] = useState<Article | null>(null)
  const [seoForm, setSeoForm] = useState({ seo_title: '', seo_description: '', seo_keywords: '', scheduled_at: '' })

  useEffect(() => { loadArticles() }, [])

  const loadArticles = async () => {
    setLoading(true)
    const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false })
    setArticles(data || [])
    setLoading(false)
  }

  const deleteArticle = async (id: string) => {
    if (!confirm('Delete this article?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(prev => prev.filter(a => a.id !== id))
  }

  const updateStatus = async (id: string, status: string) => {
    const updates: any = { status, updated_at: new Date().toISOString() }
    if (status === 'published') updates.published_at = new Date().toISOString()
    if (status === 'published') updates.published = true
    await supabase.from('articles').update(updates).eq('id', id)
    setArticles(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const saveSEO = async () => {
    if (!showSEOForm) return
    const updates = {
      seo_title: seoForm.seo_title || null,
      seo_description: seoForm.seo_description || null,
      seo_keywords: seoForm.seo_keywords.split(',').map(k => k.trim()).filter(Boolean),
      scheduled_at: seoForm.scheduled_at || null,
    }
    await supabase.from('articles').update(updates).eq('id', showSEOForm.id)
    setArticles(prev => prev.map(a => a.id === showSEOForm.id ? { ...a, ...updates } : a))
    setShowSEOForm(null)
  }

  const openSEO = (article: Article) => {
    setShowSEOForm(article)
    setSeoForm({
      seo_title: article.seo_title || article.title,
      seo_description: article.seo_description || article.excerpt || '',
      seo_keywords: (article.seo_keywords || []).join(', '),
      scheduled_at: article.scheduled_at || '',
    })
  }

  const filtered = articles.filter(a => {
    const matchesCat = filterCategory === 'all' || a.category === filterCategory
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    const matchesSearch = searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesStatus && matchesSearch
  })

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    drafts: articles.filter(a => a.status === 'draft').length,
    totalViews: articles.reduce((s, a) => s + (a.view_count || 0), 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Articles Manager</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats.total} articles | {stats.published} published | {stats.drafts} drafts | {stats.totalViews.toLocaleString()} views</p>
        </div>
        <Link href="/admin/articles/new" className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </Link>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
          <input type="text" placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading...</div> : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 dark:text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No articles found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">SEO</th>
                <th className="text-left px-4 py-3 font-medium">Stats</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(article => (
                <tr key={article.id} className="border-b border-gray-200 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="font-medium truncate max-w-[300px]">{article.title}</div>
                    {article.read_time && <div className="text-xs text-gray-500 dark:text-gray-400">{article.read_time}</div>}
                  </td>
                  <td className="px-4 py-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">{article.category}</span></td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[article.status] || 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {article.seo_title ? (
                      <span className="text-green-600 text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Set</span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400 text-xs">Missing</span>
                    )}
                    {article.scheduled_at && (
                      <div className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Scheduled</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {article.view_count || 0}</span>
                      <span className="flex items-center gap-0.5"><Star className="w-3 h-3" /> {article.like_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{new Date(article.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openSEO(article)} className="p-1.5 hover:bg-gray-100 dark:bg-gray-800 rounded" title="SEO & Schedule"><BarChart3 className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /></button>
                      {article.status === 'draft' && <button onClick={() => updateStatus(article.id, 'published')} className="p-1.5 hover:bg-green-50 rounded" title="Publish"><Send className="w-3.5 h-3.5 text-green-500" /></button>}
                      {article.status === 'published' && <button onClick={() => updateStatus(article.id, 'archived')} className="p-1.5 hover:bg-gray-100 dark:bg-gray-800 rounded" title="Archive"><Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /></button>}
                      <Link href={`/admin/articles/edit/${article.id}`} className="p-1.5 hover:bg-gray-100 dark:bg-gray-800 rounded"><Edit className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" /></Link>
                      <button onClick={() => deleteArticle(article.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEO Modal */}
      {showSEOForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-lg font-bold">SEO & Scheduling: {showSEOForm.title}</h3>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">SEO Title</label>
              <input type="text" value={seoForm.seo_title} onChange={e => setSeoForm(p => ({ ...p, seo_title: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" placeholder="SEO optimized title" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Meta Description</label>
              <textarea value={seoForm.seo_description} onChange={e => setSeoForm(p => ({ ...p, seo_description: e.target.value }))} rows={3} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm resize-none" placeholder="Search engine description (150-160 chars)" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Keywords (comma separated)</label>
              <input type="text" value={seoForm.seo_keywords} onChange={e => setSeoForm(p => ({ ...p, seo_keywords: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" placeholder="keyword1, keyword2, keyword3" />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Schedule Publication</label>
              <input type="datetime-local" value={seoForm.scheduled_at} onChange={e => setSeoForm(p => ({ ...p, scheduled_at: e.target.value }))} className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm" />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowSEOForm(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={saveSEO} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
