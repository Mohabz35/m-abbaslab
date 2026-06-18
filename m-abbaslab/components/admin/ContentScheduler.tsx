'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Calendar, Save, List, BarChart3,
  Edit2, Trash2, CheckCircle2, Clock, FileText, AlertCircle,
  Twitter, Linkedin, MessageCircle, RefreshCw,
  Plus, Github, Instagram, Facebook, Youtube, Music, Sparkles,
  Upload, Video, Image as ImageIcon, X, FileVideo, Newspaper,
  Bot, Zap, Eye, TrendingUp, BookOpen
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
type ScheduleMode = 'now' | 'schedule' | 'draft'

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduled_at: string | null
  is_draft: boolean
  status: PostStatus
  created_at: string
  updated_at?: string
  published_at?: string | null
  media_url?: string
  media_type?: 'video' | 'image'
  results?: Record<string, { success: boolean; id?: string; error?: string }> | null
}

interface Article {
  id: string
  title: string
  excerpt?: string
  content?: string
  category?: string
  tags?: string[]
  created_at: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'twitter',   label: 'X (Twitter)', color: '#1DA1F2', Icon: Twitter },
  { id: 'linkedin',  label: 'LinkedIn',    color: '#0A66C2', Icon: Linkedin },
  { id: 'instagram', label: 'Instagram',   color: '#E4405F', Icon: Instagram },
  { id: 'tiktok',    label: 'TikTok',      color: '#00F2FE', Icon: Music },
  { id: 'facebook',  label: 'Facebook',    color: '#1877F2', Icon: Facebook },
  { id: 'youtube',   label: 'YouTube',     color: '#FF0000', Icon: Youtube },
  { id: 'whatsapp',  label: 'WhatsApp',    color: '#25D366', Icon: MessageCircle },
  { id: 'telegram',  label: 'Telegram',    color: '#0088cc', Icon: Send },
  { id: 'github',    label: 'GitHub',      color: '#8b9467', Icon: Github },
]

const STATUS_CONFIG: Record<PostStatus, { color: string; label: string; Icon: any; bg: string }> = {
  draft:     { color: '#94a3b8', label: 'Draft',     Icon: FileText,    bg: 'bg-slate-500/20 border-slate-500/30' },
  scheduled: { color: '#38bdf8', label: 'Scheduled',  Icon: Clock,       bg: 'bg-blue-500/20 border-blue-500/30'  },
  published: { color: '#4ade80', label: 'Published',  Icon: CheckCircle2, bg: 'bg-emerald-500/20 border-emerald-500/30' },
  failed:    { color: '#f87171', label: 'Failed',     Icon: AlertCircle, bg: 'bg-rose-500/20 border-rose-500/30'  },
}

const TABS = [
  { id: 'compose',   label: 'Compose',   Icon: Plus },
  { id: 'articles',  label: 'From Articles', Icon: BookOpen },
  { id: 'queue',     label: 'Queue',     Icon: List },
  { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
] as const
type TabId = typeof TABS[number]['id']

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''
function apiHeaders() { return { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET } }

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, color }: { label: string; value: number; Icon: any; color: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContentScheduler() {
  const [tab, setTab] = useState<TabId>('compose')
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [loadingArticles, setLoadingArticles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Compose state
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [mode, setMode] = useState<ScheduleMode>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationTopic, setGenerationTopic] = useState('')
  const [queueFilter, setQueueFilter] = useState<'all' | PostStatus>('all')

  // Media upload state
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Article AI state
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articlePostPlatforms, setArticlePostPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [generatingFromArticle, setGeneratingFromArticle] = useState(false)
  const [articleGeneratedContent, setArticleGeneratedContent] = useState('')
  const [articleScheduleMode, setArticleScheduleMode] = useState<ScheduleMode>('schedule')
  const [articleScheduledAt, setArticleScheduledAt] = useState('')

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchPosts = useCallback(async () => {
    try {
      setRefreshing(true)
      const res = await fetch('/api/schedule', { headers: apiHeaders() })
      const data = await res.json()
      setPosts(data.posts || [])
    } catch { showToast('Failed to load queue.', 'error') }
    finally { setRefreshing(false) }
  }, [])

  const fetchArticles = useCallback(async () => {
    try {
      setLoadingArticles(true)
      const res = await fetch('/api/admin/articles')
      const data = await res.json()
      setArticles(data.success ? (data.articles || []) : [])
    } catch { /* non-critical */ }
    finally { setLoadingArticles(false) }
  }, [])

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 30000)
    return () => clearInterval(interval)
  }, [fetchPosts])

  useEffect(() => {
    if (tab === 'articles') fetchArticles()
  }, [tab, fetchArticles])

  const togglePlatform = (id: string, setter: any, current: string[]) => {
    setter(current.includes(id) ? current.filter(p => p !== id) : [...current, id])
  }

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')
    if (!isVideo && !isImage) { showToast('Only images and videos are supported.', 'error'); return }
    if (isVideo && file.size > 500 * 1024 * 1024) { showToast('Video must be under 500MB.', 'error'); return }
    if (isImage && file.size > 1 * 1024 * 1024) { showToast('Image must be under 1MB.', 'error'); return }
    setMediaFile(file)
    setMediaType(isVideo ? 'video' : 'image')
    setMediaPreview(URL.createObjectURL(file))
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setMediaType(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const charCount = content.length
  const twitterOver = platforms.includes('twitter') && charCount > 280

  const resetCompose = () => {
    setContent('')
    setPlatforms(['twitter', 'linkedin'])
    setMode('now')
    setScheduledAt('')
    setEditingId(null)
    removeMedia()
  }

  const handleGenerateContent = async () => {
    if (!generationTopic.trim()) { showToast('Enter a topic first.', 'error'); return }
    if (platforms.length === 0) { showToast('Select at least one platform.', 'error'); return }
    setIsGenerating(true)
    try {
      const res = await fetch('/api/admin/generate-post', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ topic: generationTopic.trim(), platforms, tone: 'professional', length: 'medium' }),
      })
      const data = await res.json()
      if (data.success && data.content) {
        const firstPlatform = platforms[0]
        const text = data.content[firstPlatform] || Object.values(data.content).find(v => typeof v === 'string') || ''
        if (!text) { showToast('Generation returned empty content.', 'error'); return }
        setContent(String(text))
        setGenerationTopic('')
        showToast('Content generated! Review before posting.')
      } else { showToast(data.error || 'Failed to generate.', 'error') }
    } catch { showToast('Generation failed. Check API keys.', 'error') }
    finally { setIsGenerating(false) }
  }

  const handleGenerateFromArticle = async (article: Article) => {
    setSelectedArticle(article)
    setGeneratingFromArticle(true)
    setArticleGeneratedContent('')
    try {
      const res = await fetch('/api/admin/generate-post', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          topic: `Based on this article: "${article.title}". Excerpt: ${article.excerpt || ''}. Create an engaging social media post that summarizes the key insight and links back to the article.`,
          platforms: articlePostPlatforms,
          tone: 'professional',
          length: 'medium',
        }),
      })
      const data = await res.json()
      if (data.success && data.content) {
        const firstPlatform = articlePostPlatforms[0]
        const text = data.content[firstPlatform] || Object.values(data.content).find(v => typeof v === 'string') || ''
        setArticleGeneratedContent(String(text))
        showToast('Post drafted from your article! Review and schedule below.')
      } else { showToast(data.error || 'Failed to generate from article.', 'error') }
    } catch { showToast('Failed to generate from article.', 'error') }
    finally { setGeneratingFromArticle(false) }
  }

  const handleScheduleArticlePost = async () => {
    if (!articleGeneratedContent.trim()) { showToast('Generate content from an article first.', 'error'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          content: articleGeneratedContent,
          platforms: articlePostPlatforms,
          scheduledAt: articleScheduleMode === 'schedule' ? articleScheduledAt : undefined,
          isDraft: articleScheduleMode === 'draft',
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(articleScheduleMode === 'now' ? 'Posted! 🚀' : articleScheduleMode === 'draft' ? 'Draft saved.' : 'Scheduled ✅')
        setSelectedArticle(null)
        setArticleGeneratedContent('')
        setTab('queue')
        fetchPosts()
      }
    } catch { showToast('Failed to schedule post.', 'error') }
    finally { setLoading(false) }
  }

  const handleSubmit = async () => {
    if (!content.trim()) { showToast('Write something first.', 'error'); return }
    if (platforms.length === 0) { showToast('Select at least one platform.', 'error'); return }
    if (twitterOver) { showToast('Tweet exceeds 280 characters.', 'error'); return }
    if (mode === 'schedule' && !scheduledAt) { showToast('Pick a date and time.', 'error'); return }

    setLoading(true)
    try {
      if (mode === 'now') {
        const res = await fetch('/api/schedule', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({ content, platforms, isNow: true }),
        })
        const data = await res.json()
        if (data.success) {
          const errs = data.post?.results ? Object.entries(data.post.results).filter(([, r]: any) => !r.success).map(([p, r]: any) => `${p}: ${r.error}`).join(' | ') : ''
          if (errs) showToast(`Partial: ${errs}`, 'error')
          else showToast('Posted!')
          resetCompose()
          fetchPosts()
        } else {
          showToast(data.error || 'Failed to post.', 'error')
        }
      } else {
        const method = editingId ? 'PATCH' : 'POST'
        const body = editingId
          ? { id: editingId, content, platforms, scheduledAt: mode === 'schedule' ? scheduledAt : undefined, isDraft: mode === 'draft' }
          : { content, platforms, scheduledAt: mode === 'schedule' ? scheduledAt : undefined, isDraft: mode === 'draft' }
        const res = await fetch('/api/schedule', { method, headers: apiHeaders(), body: JSON.stringify(body) })
        const data = await res.json()
        if (data.success) { showToast(mode === 'draft' ? 'Draft saved.' : 'Scheduled ✅'); resetCompose(); if (mode === 'schedule') setTab('queue'); fetchPosts() }
      }
    } catch { showToast('Something went wrong.', 'error') }
    finally { setLoading(false) }
  }

  const handleEdit = (post: ScheduledPost) => {
    setContent(post.content)
    setPlatforms(post.platforms)
    setEditingId(post.id)
    setMode(post.is_draft ? 'draft' : 'schedule')
    setScheduledAt(post.scheduled_at || '')
    setTab('compose')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/schedule', { method: 'DELETE', headers: apiHeaders(), body: JSON.stringify({ id }) })
    const data = await res.json()
    if (data.success) { showToast('Deleted.'); fetchPosts() }
    else showToast('Failed to delete.', 'error')
  }

  const counts = {
    all: posts.length,
    draft: posts.filter(p => p.status === 'draft').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
  }

  const filteredPosts = queueFilter === 'all' ? posts : posts.filter(p => p.status === queueFilter)
  const minDateTime = new Date(Date.now() + 2 * 60000).toISOString().slice(0, 16)

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-bold shadow-2xl border ${toast.type === 'error' ? 'bg-rose-600 border-rose-500' : 'bg-emerald-600 border-emerald-500'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl"><Send className="w-6 h-6 text-indigo-400" /></div>
            Content Scheduler
          </h2>
          <p className="text-sm text-slate-400 mt-1">Post to 9 platforms · AI-powered · Upload videos · Auto-schedule from articles</p>
        </div>
        <button onClick={fetchPosts} className="p-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors" title="Refresh queue">
          <RefreshCw className={`w-4 h-4 text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/40 px-2 overflow-x-auto">
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${
                tab === id ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
              }`}>
              <Icon className="w-4 h-4" />
              {id === 'queue' ? `Queue (${counts.all})` : label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              {/* ── COMPOSE TAB ── */}
              {tab === 'compose' && (
                <div className="space-y-6">
                  {editingId && (
                    <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-400 flex items-center justify-between">
                      <span className="flex items-center gap-2"><Edit2 className="w-4 h-4" /> Editing existing post</span>
                      <button onClick={resetCompose} className="text-rose-400 hover:text-rose-300 text-xs font-bold">✕ Cancel</button>
                    </div>
                  )}

                  {/* Platform Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Post To</label>
                    <div className="flex flex-wrap gap-2">
                      {PLATFORMS.map(({ id, label, color, Icon }) => {
                        const active = platforms.includes(id)
                        return (
                          <button key={id} onClick={() => togglePlatform(id, setPlatforms, platforms)}
                            style={active ? { borderColor: color, color } : {}}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${active ? 'bg-white/5' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                            <Icon className="w-4 h-4" /> {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* AI Generation */}
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 space-y-3">
                    <label className="block text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> AI Generate from Topic
                    </label>
                    <div className="flex gap-2">
                      <input type="text" value={generationTopic} onChange={e => setGenerationTopic(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleGenerateContent()}
                        placeholder="e.g., AI impact on financial markets..."
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600" />
                      <button onClick={handleGenerateContent} disabled={isGenerating || !generationTopic.trim() || platforms.length === 0}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs uppercase disabled:opacity-50 flex items-center gap-2 transition-colors">
                        <Bot className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate'}
                      </button>
                    </div>
                  </div>

                  {/* Content Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)}
                      placeholder="What do you want to share today?"
                      rows={5}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600" />
                    <div className={`text-right text-xs mt-1 ${twitterOver ? 'text-rose-400 font-bold' : charCount > 240 ? 'text-amber-400' : 'text-slate-500'}`}>
                      {charCount} chars {twitterOver && '— exceeds X limit of 280'}
                    </div>
                  </div>

                  {/* Media Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Attach Media (Image / Video)
                    </label>
                    {!mediaFile ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                        <div className="flex gap-4 mb-2">
                          <ImageIcon className="w-8 h-8 text-slate-600 group-hover:text-slate-400 transition-colors" />
                          <FileVideo className="w-8 h-8 text-slate-600 group-hover:text-slate-400 transition-colors" />
                        </div>
                        <p className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">Click to upload image or video</p>
                        <p className="text-xs text-slate-600 mt-1">Images up to 1MB · Videos up to 500MB</p>
                        <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaSelect} className="hidden" />
                      </div>
                    ) : (
                      <div className="relative border border-slate-700 rounded-xl overflow-hidden">
                        {mediaType === 'image' ? (
                          <img src={mediaPreview!} alt="Upload preview" className="w-full max-h-64 object-cover" />
                        ) : (
                          <video src={mediaPreview!} className="w-full max-h-64 object-cover" controls />
                        )}
                        <div className="absolute top-2 right-2 flex gap-2">
                          <div className={`px-2 py-1 rounded text-[10px] font-bold ${mediaType === 'video' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {mediaType === 'video' ? '🎥 VIDEO' : '🖼 IMAGE'}
                          </div>
                          <button onClick={removeMedia} className="p-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-lg">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3 bg-slate-900/50">
                          <p className="text-xs text-slate-400 truncate">{mediaFile.name} · {(mediaFile.size / 1024 / 1024).toFixed(1)}MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timing Mode */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Timing</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {([
                        { id: 'now', label: '🚀 Post Now' },
                        { id: 'schedule', label: '🗓 Schedule' },
                        { id: 'draft', label: '💾 Save Draft' },
                      ] as const).map(({ id, label }) => (
                        <button key={id} onClick={() => setMode(id)}
                          className={`px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${mode === id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                          {label}
                        </button>
                      ))}
                    </div>

                    {mode === 'schedule' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date & Time</label>
                        <input type="datetime-local" value={scheduledAt} min={minDateTime} onChange={e => setScheduledAt(e.target.value)}
                          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 [color-scheme:dark]" />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={loading || !content.trim() || platforms.length === 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {isUploading ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading media...</>
                    ) : loading ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Processing...</>
                    ) : mode === 'now' ? '🚀 Post Now'
                      : mode === 'draft' ? '💾 Save Draft'
                      : '🗓 Schedule Post'}
                  </button>

                  {/* Preview */}
                  {content.trim() && (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Preview</span>
                      </div>
                      <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {platforms.map(pid => {
                          const pl = PLATFORMS.find(p => p.id === pid)
                          if (!pl) return null
                          return (
                            <span key={pid} style={{ color: pl.color, borderColor: pl.color + '44' }} className="text-xs px-3 py-1 border rounded-full">
                              {pl.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── FROM ARTICLES TAB ── */}
              {tab === 'articles' && (
                <div className="space-y-5">
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex gap-3">
                    <Newspaper className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-indigo-400">AI Auto-Post from Articles</p>
                      <p className="text-sm text-slate-400 mt-0.5">Select an article below. JARVIS will read it, summarize the key insight, and generate a ready-to-post social media caption. You can then schedule or post it directly.</p>
                    </div>
                  </div>

                  {/* Article List */}
                  {loadingArticles ? (
                    <div className="text-center py-10 text-slate-500">Loading articles...</div>
                  ) : articles.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No articles found. Create some in the Articles section first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                      {articles.map(article => (
                        <button key={article.id} onClick={() => handleGenerateFromArticle(article)}
                          className={`text-left p-4 rounded-xl border transition-all ${selectedArticle?.id === article.id ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}`}>
                          <p className="font-bold text-white text-sm leading-snug line-clamp-2">{article.title}</p>
                          {article.category && <p className="text-xs text-indigo-400 mt-1 capitalize">{article.category}</p>}
                          <p className="text-xs text-slate-500 mt-1">{new Date(article.created_at).toLocaleDateString()}</p>
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {article.tags.slice(0, 3).map((t, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">#{t}</span>)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Generated post from article */}
                  {(generatingFromArticle || articleGeneratedContent) && (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                        <Bot className="w-4 h-4 animate-pulse" />
                        {generatingFromArticle ? 'Reading article and crafting post...' : `Generated post for: "${selectedArticle?.title}"`}
                      </div>

                      {!generatingFromArticle && (
                        <>
                          <textarea value={articleGeneratedContent} onChange={e => setArticleGeneratedContent(e.target.value)}
                            rows={5}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm resize-none outline-none focus:border-indigo-500 transition-all" />

                          {/* Platform selector for article post */}
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Post To</label>
                            <div className="flex flex-wrap gap-2">
                              {PLATFORMS.map(({ id, label, color, Icon }) => {
                                const active = articlePostPlatforms.includes(id)
                                return (
                                  <button key={id} onClick={() => togglePlatform(id, setArticlePostPlatforms, articlePostPlatforms)}
                                    style={active ? { borderColor: color, color } : {}}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${active ? 'bg-white/5' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                                    <Icon className="w-3.5 h-3.5" /> {label}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Mode */}
                          <div className="flex flex-wrap gap-2">
                            {([
                              { id: 'now', label: '🚀 Post Now' },
                              { id: 'schedule', label: '🗓 Schedule' },
                              { id: 'draft', label: '💾 Save Draft' },
                            ] as const).map(({ id, label }) => (
                              <button key={id} onClick={() => setArticleScheduleMode(id)}
                                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${articleScheduleMode === id ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                                {label}
                              </button>
                            ))}
                          </div>

                          {articleScheduleMode === 'schedule' && (
                            <input type="datetime-local" value={articleScheduledAt} min={minDateTime} onChange={e => setArticleScheduledAt(e.target.value)}
                              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 [color-scheme:dark]" />
                          )}

                          <button onClick={handleScheduleArticlePost} disabled={loading || !articleGeneratedContent.trim()}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4" />
                            {loading ? 'Processing...' : articleScheduleMode === 'now' ? '🚀 Post Now' : articleScheduleMode === 'draft' ? '💾 Save Draft' : '🗓 Schedule Post'}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── QUEUE TAB ── */}
              {tab === 'queue' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'scheduled', 'draft', 'published', 'failed'] as const).map(f => {
                      const count = counts[f]
                      const cfg = f !== 'all' ? STATUS_CONFIG[f] : null
                      return (
                        <button key={f} onClick={() => setQueueFilter(f)}
                          style={queueFilter === f ? { borderColor: cfg?.color || '#6366f1', color: cfg?.color || '#6366f1' } : {}}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide transition-all ${queueFilter === f ? 'bg-white/5' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                        </button>
                      )
                    })}
                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No posts here yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPosts.map(post => {
                        const cfg = STATUS_CONFIG[post.status]
                        const StatusIcon = cfg.Icon
                        return (
                          <div key={post.id} className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <span className={`flex items-center gap-1.5 text-xs font-bold border px-2.5 py-1 rounded-full ${cfg.bg}`} style={{ color: cfg.color }}>
                                <StatusIcon className="w-3 h-3" /> {cfg.label}
                              </span>
                              <div className="flex gap-3">
                                {(post.status === 'draft' || post.status === 'scheduled') && (
                                  <button onClick={() => handleEdit(post)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                    <Edit2 className="w-3 h-3" /> Edit
                                  </button>
                                )}
                                {post.status !== 'published' && (
                                  <button onClick={() => handleDelete(post.id)} className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap mb-3 leading-relaxed line-clamp-3">{post.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                 {post.platforms.map(pid => {
                                   const pl = PLATFORMS.find(p => p.id === pid)
                                   if (!pl) return null
                                   return <div key={pid} title={pl.label}><pl.Icon style={{ color: pl.color }} className="w-4 h-4 opacity-80" /></div>
                                 })}
                              </div>
                              <span className="text-xs text-slate-500">
                                {post.status === 'scheduled' && post.scheduled_at ? `📅 ${new Date(post.scheduled_at).toLocaleString()}`
                                  : post.status === 'published' && post.published_at ? `✅ ${new Date(post.published_at).toLocaleString()}`
                                  : `Created ${new Date(post.created_at).toLocaleDateString()}`}
                              </span>
                            </div>
                            {post.status === 'failed' && post.results && (
                              <div className="mt-2 pt-2 border-t border-rose-500/20 space-y-1">
                                {Object.entries(post.results).filter(([, r]) => !r.success).map(([p, r]) => (
                                  <p key={p} className="text-xs text-rose-400">⚠️ {p}: {r.error}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── ANALYTICS TAB ── */}
              {tab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Posts" value={counts.all} Icon={List} color="bg-slate-500/20 text-slate-300" />
                    <StatCard label="Published" value={counts.published} Icon={CheckCircle2} color="bg-emerald-500/20 text-emerald-400" />
                    <StatCard label="Scheduled" value={counts.scheduled} Icon={Clock} color="bg-blue-500/20 text-blue-400" />
                    <StatCard label="Failed" value={counts.failed} Icon={AlertCircle} color="bg-rose-500/20 text-rose-400" />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Platform Breakdown (Published Posts)</h3>
                    <div className="space-y-3">
                      {PLATFORMS.map(({ id, label, color, Icon }) => {
                        const count = posts.filter(p => p.platforms.includes(id) && p.status === 'published').length
                        const pct = counts.published > 0 ? Math.round((count / counts.published) * 100) : 0
                        return (
                          <div key={id} className="flex items-center gap-4">
                            <div style={{ color }} className="flex items-center gap-1.5 w-28 shrink-0 text-xs font-bold">
                              <Icon className="w-4 h-4" /> {label}
                            </div>
                            <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                                className="h-full rounded-full" style={{ backgroundColor: color }} />
                            </div>
                            <span className="text-xs text-slate-400 w-16 text-right">{count} posts</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-400">Auto-publish Active</p>
                      <p className="text-xs text-slate-400 mt-1">Cron job runs every minute on Vercel — scheduled posts publish automatically without any manual action.</p>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
