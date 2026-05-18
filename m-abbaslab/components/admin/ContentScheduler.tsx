'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Calendar, Save, List, BarChart3,
  Edit2, Trash2, TrendingUp, TrendingDown,
  CheckCircle2, Clock, FileText, AlertCircle,
  Twitter, Linkedin, MessageCircle, RefreshCw,
  Plus, Github, Instagram, Facebook, Youtube, Music
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'
type ScheduleMode = 'now' | 'schedule' | 'draft'

interface ScheduledPost {
  id: string
  content: string
  platforms: string[]
  scheduledAt: string | null
  isDraft: boolean
  status: PostStatus
  createdAt: string
  updatedAt?: string
  publishedAt?: string
  results?: Record<string, { success: boolean; id?: string; error?: string }> | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: 'twitter', label: 'X (Twitter)', color: '#1DA1F2', Icon: Twitter },
  { id: 'linkedin', label: 'LinkedIn', color: '#0A66C2', Icon: Linkedin },
  { id: 'instagram', label: 'Instagram', color: '#E4405F', Icon: Instagram },
  { id: 'tiktok', label: 'TikTok', color: '#00F2FE', Icon: Music },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', Icon: Facebook },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', Icon: Youtube },
  { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', Icon: MessageCircle },
  { id: 'telegram', label: 'Telegram', color: '#0088cc', Icon: Send },
  { id: 'github', label: 'GitHub', color: '#24292F', Icon: Github }
]

const STATUS_CONFIG: Record<PostStatus, { color: string; label: string; Icon: any }> = {
  draft:     { color: '#888',     label: 'Draft',     Icon: FileText },
  scheduled: { color: '#00d4ff', label: 'Scheduled',  Icon: Clock },
  published: { color: '#22c55e', label: 'Published',  Icon: CheckCircle2 },
  failed:    { color: '#ef4444', label: 'Failed',     Icon: AlertCircle },
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

function apiHeaders() {
  return { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentScheduler() {
  const [tab, setTab] = useState<'compose' | 'queue' | 'analytics'>('compose')
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  // Compose state
  const [content, setContent] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['twitter', 'linkedin'])
  const [mode, setMode] = useState<ScheduleMode>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [queueFilter, setQueueFilter] = useState<'all' | PostStatus>('all')

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
    } catch {
      showToast('Failed to load queue.', 'error')
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
    const interval = setInterval(fetchPosts, 30000)
    return () => clearInterval(interval)
  }, [fetchPosts])

  const togglePlatform = (id: string) => {
    setPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const charCount = content.length
  const twitterOver = platforms.includes('twitter') && charCount > 280

  const resetCompose = () => {
    setContent('')
    setPlatforms(['twitter', 'linkedin'])
    setMode('now')
    setScheduledAt('')
    setEditingId(null)
  }

  const handleSubmit = async () => {
    if (!content.trim()) return showToast('Write something first.', 'error')
    if (platforms.length === 0) return showToast('Select at least one platform.', 'error')
    if (twitterOver) return showToast('Tweet exceeds 280 characters.', 'error')
    if (mode === 'schedule' && !scheduledAt) return showToast('Pick a date and time.', 'error')

    setLoading(true)
    try {
      if (mode === 'now') {
        const res = await fetch('/api/post-now', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify({ content, platforms }),
        })
        const data = await res.json()
        if (data.success) {
          showToast('Posted! 🚀')
          resetCompose()
          fetchPosts()
        } else {
          const errs = Object.entries(data.results || {})
            .filter(([, r]: any) => !r.success)
            .map(([p, r]: any) => `${p}: ${r.error}`)
            .join(' | ')
          showToast(errs || 'Failed to post.', 'error')
        }
      } else {
        const method = editingId ? 'PATCH' : 'POST'
        const body = editingId
          ? { id: editingId, content, platforms, scheduledAt: mode === 'schedule' ? scheduledAt : undefined, isDraft: mode === 'draft' }
          : { content, platforms, scheduledAt: mode === 'schedule' ? scheduledAt : undefined, isDraft: mode === 'draft' }

        const res = await fetch('/api/schedule', {
          method,
          headers: apiHeaders(),
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (data.success) {
          showToast(mode === 'draft' ? 'Draft saved.' : `Scheduled ✅`)
          resetCompose()
          if (mode === 'schedule') setTab('queue')
          fetchPosts()
        }
      }
    } catch {
      showToast('Something went wrong.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (post: ScheduledPost) => {
    setContent(post.content)
    setPlatforms(post.platforms)
    setEditingId(post.id)
    setMode(post.isDraft ? 'draft' : 'schedule')
    setScheduledAt(post.scheduledAt || '')
    setTab('compose')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const res = await fetch('/api/schedule', {
      method: 'DELETE',
      headers: apiHeaders(),
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (data.success) { showToast('Deleted.'); fetchPosts() }
    else showToast('Failed to delete.', 'error')
  }

  const counts = {
    all:       posts.length,
    draft:     posts.filter((p) => p.status === 'draft').length,
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    failed:    posts.filter((p) => p.status === 'failed').length,
  }

  const filteredPosts =
    queueFilter === 'all' ? posts : posts.filter((p) => p.status === queueFilter)

  const minDateTime = new Date(Date.now() + 2 * 60000).toISOString().slice(0, 16)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl text-white text-sm font-medium shadow-2xl ${
              toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-500" />
            Content Scheduler
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">X · LinkedIn · Instagram · TikTok · Facebook · YouTube · WhatsApp · Telegram · GitHub — automated</p>
        </div>
        <button
          onClick={fetchPosts}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh queue"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-800 px-4 gap-1">
        {([
          { id: 'compose',   label: 'Compose',         icon: Plus },
          { id: 'queue',     label: `Queue (${counts.all})`, icon: List },
          { id: 'analytics', label: 'Stats',            icon: BarChart3 },
        ] as const).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* ── COMPOSE TAB ── */}
          {tab === 'compose' && (
            <motion.div key="compose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {editingId && (
                <div className="mb-4 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>✏️ Editing post</span>
                  <button onClick={resetCompose} className="text-rose-500 hover:underline text-xs">
                    Cancel
                  </button>
                </div>
              )}

              {/* Platform selector */}
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Post to
              </label>
              <div className="flex flex-wrap gap-2 mb-5">
                {PLATFORMS.map(({ id, label, color, Icon }) => {
                  const active = platforms.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => togglePlatform(id)}
                      style={{ borderColor: active ? color : undefined, color: active ? color : undefined }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? 'bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Content area */}
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What do you want to share today?"
                rows={5}
                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white text-sm resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <div
                className={`text-right text-xs mt-1 mb-5 ${
                  twitterOver ? 'text-rose-500 font-bold' : charCount > 240 ? 'text-amber-500' : 'text-gray-400'
                }`}
              >
                {charCount} chars {twitterOver && '— exceeds X limit of 280'}
              </div>

              {/* Timing mode */}
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Timing
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {([
                  { id: 'now', label: '🚀 Post Now' },
                  { id: 'schedule', label: '🗓 Schedule' },
                  { id: 'draft', label: '💾 Save Draft' },
                ] as const).map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                      mode === id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === 'schedule' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={minDateTime}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading || !content.trim() || platforms.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'now'
                  ? '🚀 Post Now'
                  : mode === 'draft'
                  ? '💾 Save Draft'
                  : '🗓 Schedule Post'}
              </button>

              {/* Live preview */}
              {content.trim() && (
                <div className="mt-5 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">Preview</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {content}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {platforms.map((pid) => {
                      const pl = PLATFORMS.find((p) => p.id === pid)
                      if (!pl) return null
                      return (
                        <span
                          key={pid}
                          style={{ color: pl.color, borderColor: pl.color + '44' }}
                          className="text-xs px-3 py-1 border rounded-full"
                        >
                          {pl.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── QUEUE TAB ── */}
          {tab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Filter chips */}
              <div className="flex flex-wrap gap-2 mb-5">
                {(['all', 'scheduled', 'draft', 'published', 'failed'] as const).map((f) => {
                  const count = counts[f]
                  const cfg = f !== 'all' ? STATUS_CONFIG[f] : null
                  return (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      style={queueFilter === f ? { borderColor: cfg?.color || '#3b82f6', color: cfg?.color || '#3b82f6' } : {}}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        queueFilter === f
                          ? 'bg-opacity-10'
                          : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                    </button>
                  )
                })}
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No posts here yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post) => {
                    const cfg = STATUS_CONFIG[post.status]
                    const StatusIcon = cfg.Icon
                    return (
                      <div
                        key={post.id}
                        className="p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            style={{ color: cfg.color, borderColor: cfg.color + '44' }}
                            className="flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1 rounded-full"
                          >
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          <div className="flex gap-3">
                            {(post.status === 'draft' || post.status === 'scheduled') && (
                              <button
                                onClick={() => handleEdit(post)}
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                            )}
                            {post.status !== 'published' && (
                              <button
                                onClick={() => handleDelete(post.id)}
                                className="text-xs text-rose-500 hover:underline flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-3 leading-relaxed">
                          {post.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex gap-1.5">
                            {post.platforms.map((pid) => {
                              const pl = PLATFORMS.find((p) => p.id === pid)
                              if (!pl) return null
                              const PlIcon = pl.Icon
                              return (
                                <span
                                  key={pid}
                                  style={{ color: pl.color }}
                                  className="text-xs opacity-80"
                                  title={pl.label}
                                >
                                  <PlIcon className="w-4 h-4" />
                                </span>
                              )
                            })}
                          </div>
                          <span className="text-xs text-gray-400">
                            {post.status === 'scheduled' && post.scheduledAt
                              ? `📅 ${new Date(post.scheduledAt).toLocaleString()}`
                              : post.status === 'published' && post.publishedAt
                              ? `✅ ${new Date(post.publishedAt).toLocaleString()}`
                              : `Created ${new Date(post.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>

                        {post.status === 'failed' && post.results && (
                          <div className="mt-2 pt-2 border-t border-rose-100 dark:border-rose-900/20">
                            {Object.entries(post.results)
                              .filter(([, r]) => !r.success)
                              .map(([p, r]) => (
                                <p key={p} className="text-xs text-rose-500">
                                  ⚠️ {p}: {r.error}
                                </p>
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {tab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                {(
                  [
                    { label: 'Total',     value: counts.all,       color: 'text-gray-700 dark:text-gray-200' },
                    { label: 'Published', value: counts.published,  color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Scheduled', value: counts.scheduled,  color: 'text-blue-600 dark:text-blue-400' },
                    { label: 'Drafts',    value: counts.draft,      color: 'text-gray-400' },
                    { label: 'Failed',    value: counts.failed,     color: 'text-rose-500' },
                  ] as const
                ).map((s) => (
                  <div key={s.label} className="bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl p-4 text-center">
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Platform Breakdown (published)
              </h3>
              <div className="space-y-4">
                {PLATFORMS.map(({ id, label, color, Icon }) => {
                  const count = posts.filter(
                    (p) => p.platforms.includes(id) && p.status === 'published'
                  ).length
                  const pct = counts.published > 0 ? Math.round((count / counts.published) * 100) : 0
                  return (
                    <div key={id} className="flex items-center gap-4">
                      <div style={{ color }} className="flex items-center gap-1.5 w-28 flex-shrink-0 text-sm font-medium">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                      <div className="flex-1 h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{count} posts</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  Cron job running every minute on Vercel — scheduled posts publish automatically.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
