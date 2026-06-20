'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, FileText, Sparkles, X, Wand2, Briefcase } from 'lucide-react'
import ArticleForm from './ArticleForm'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArticlesManager() {
  const [articles, setArticles] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingArticle, setEditingArticle] = useState<any | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  
  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  const fetchArticles = async () => {
    setLoading(true)
    try {
      const [resArticles, resProjects] = await Promise.all([
        fetch('/api/admin/articles'),
        fetch('/api/admin/projects')
      ])
      const dataArticles = await resArticles.json()
      const dataProjects = await resProjects.json()
      
      if (dataArticles.success) setArticles(dataArticles.articles)
      if (dataProjects.success) setProjects(dataProjects.projects.filter((p: any) => p.status !== 'shipped'))
    } catch (e) {
      console.error('Failed to fetch articles', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  const handleSaveArticle = async (values: any) => {
    const method = editingArticle ? 'PUT' : 'POST'
    const body = editingArticle ? { ...values, id: editingArticle.id } : values
    
    try {
      const res = await fetch('/api/admin/articles', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      if (res.ok) {
        setIsEditing(false)
        setEditingArticle(null)
        fetchArticles()
      }
    } catch (error) {
      console.error('Failed to save article', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return
    try {
      await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' })
      fetchArticles()
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  const handleAiAction = async (action: string) => {
    if (!aiPrompt) return
    setIsAiLoading(true)
    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, prompt: aiPrompt, content: editingArticle?.content })
      })
      const data = await res.json()
      if (data.success) {
        setAiResponse(data.result)
      }
    } catch (e) {
      console.error('AI Error', e)
    } finally {
      setIsAiLoading(false)
    }
  }

  const categories = ['all', ...Array.from(new Set(articles.map(a => a.category).filter(Boolean)))]

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) || 
      (a.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.tags || []).join(' ').toLowerCase().includes(search.toLowerCase())
    
    const matchesCategory = activeCategory === 'all' || a.category === activeCategory
    
    return matchesSearch && matchesCategory
  })

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Edit className="w-5 h-5 text-emerald-400"/> {editingArticle ? 'Edit Article' : 'Write Article'}</h2>
          <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ArticleForm 
              mode={editingArticle ? 'edit' : 'create'} 
              initial={editingArticle || undefined} 
              onSubmit={handleSaveArticle} 
            />
          </div>
          
          {/* AI Assistant Sidebar */}
          <div className="bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 p-6 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Sparkles className="w-5 h-5 text-purple-400"/> AI Assistant</h3>
            <p className="text-xs text-slate-400 mb-4">Need help writing? Ask Jarvis for ideas, summaries, or co-authoring.</p>
            
            <textarea 
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              placeholder="e.g., Generate a title about Quantum Computing..."
              className="w-full bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg p-3 text-sm text-white mb-3"
              rows={3}
            />
            
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => handleAiAction('suggest_ideas')} disabled={isAiLoading || !aiPrompt} className="px-3 py-1.5 bg-purple-500/20 text-purple-400 border border-gray-200 dark:border-gray-700 border-purple-500/30 rounded text-xs hover:bg-purple-500/30 transition-colors disabled:opacity-50">Suggest Ideas</button>
              <button onClick={() => { setAiPrompt('What are the top trending topics in tech/AI right now?'); handleAiAction('trending_topics') }} disabled={isAiLoading} className="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-gray-200 dark:border-gray-700 border-rose-500/30 rounded text-xs hover:bg-rose-500/30 transition-colors disabled:opacity-50">🔥 Trending Topics</button>
              <button onClick={() => handleAiAction('co_author')} disabled={isAiLoading || !aiPrompt} className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-gray-200 dark:border-gray-700 border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-colors disabled:opacity-50">Co-Author</button>
              <button onClick={() => handleAiAction('summarize')} disabled={isAiLoading || !aiPrompt} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-gray-200 dark:border-gray-700 border-emerald-500/30 rounded text-xs hover:bg-emerald-500/30 transition-colors disabled:opacity-50">Summarize Content</button>
            </div>
            
            <AnimatePresence>
              {aiResponse && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/80 p-4 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-purple-400 uppercase">Jarvis Response</span>
                    <button onClick={() => setAiResponse('')} className="text-slate-400 hover:text-white"><X className="w-3 h-3"/></button>
                  </div>
                  <div className="text-sm text-slate-300 whitespace-pre-wrap">{aiResponse}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="w-6 h-6 text-emerald-500"/> Article Manager</h2>
          <p className="text-sm text-slate-400">Manage publications, research, and technical writing.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-4 py-2 bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
          </div>
          <button onClick={() => { setEditingArticle(null); setIsEditing(true) }} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Write Article
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Filters Bar */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeCategory === cat 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading articles...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No articles found.</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 font-mono text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Title & Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Metrics</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredArticles.map(article => (
                <tr key={article.id} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white mb-1">{article.title}</div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {article.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${article.published ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                    {article.featured && <div className="mt-2"><span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-purple-500/20 text-purple-400">Featured</span></div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300 font-mono space-y-1">
                      <div><span className="text-slate-400">Reads:</span> {Math.floor(Math.random() * 5000) + 100}</div>
                      <div><span className="text-slate-400">Completion:</span> {Math.floor(Math.random() * 40) + 40}%</div>
                      <div><span className="text-slate-400">Time:</span> {article.read_time}m</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingArticle(article); setIsEditing(true) }} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
      
      {/* Active Projects Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 p-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-purple-400" /> Active Projects
          </h3>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No active projects found.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} className="p-3 bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700">
                  <div className="font-medium text-sm text-white">{project.title}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">{project.category}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">{project.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
