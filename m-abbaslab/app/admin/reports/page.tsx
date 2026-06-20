'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart3, Download, Calendar, Filter, FileText, TrendingUp,
  Users, Eye, MessageSquare, Briefcase, Mail, Clock
} from 'lucide-react'

type ReportData = {
  articles: { total: number; published: number; drafts: number; totalViews: number; totalLikes: number; avgViews: number }
  projects: { total: number; featured: number; totalViews: number }
  fashion: { total: number; featured: number; totalViews: number }
  contacts: { total: number; new_count: number; replied: number }
  subscribers: { total: number; active: number; growth: number }
  topArticles: { title: string; views: number; likes: number; category: string }[]
  contentByCategory: { category: string; count: number }[]
}

const reportTypes = [
  { id: 'overview', label: 'Content Overview', icon: FileText },
  { id: 'engagement', label: 'Engagement Report', icon: TrendingUp },
  { id: 'growth', label: 'Growth Metrics', icon: BarChart3 },
  { id: 'performance', label: 'Performance', icon: Clock },
]

export default function AdvancedReporting() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [reportType, setReportType] = useState('overview')

  useEffect(() => { loadReport() }, [timeRange])

  const loadReport = async () => {
    setLoading(true)
    const since = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString()

    const [articlesRes, projectsRes, fashionRes, contactsRes, subsRes] = await Promise.all([
      supabase.from('articles').select('*'),
      supabase.from('projects').select('*'),
      supabase.from('fashion_items').select('*'),
      supabase.from('contact_submissions').select('*').gte('created_at', since),
      supabase.from('email_subscribers').select('*'),
    ])

    const articles = articlesRes.data || []
    const projects = projectsRes.data || []
    const fashion = fashionRes.data || []
    const contacts = contactsRes.data || []
    const subs = subsRes.data || []

    const articlesWithViews = articles.filter(a => a.view_count > 0).sort((a, b) => (b.view_count || 0) - (a.view_count || 0))

    const catMap = new Map<string, number>()
    articles.forEach(a => { const c = a.category || 'Uncategorized'; catMap.set(c, (catMap.get(c) || 0) + 1) })

    setData({
      articles: {
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        drafts: articles.filter(a => a.status === 'draft').length,
        totalViews: articles.reduce((s, a) => s + (a.view_count || 0), 0),
        totalLikes: articles.reduce((s, a) => s + (a.like_count || 0), 0),
        avgViews: articles.length > 0 ? Math.round(articles.reduce((s, a) => s + (a.view_count || 0), 0) / articles.length) : 0,
      },
      projects: {
        total: projects.length,
        featured: projects.filter(p => p.featured).length,
        totalViews: projects.reduce((s, p) => s + (p.view_count || 0), 0),
      },
      fashion: {
        total: fashion.length,
        featured: fashion.filter((f: any) => f.is_featured).length,
        totalViews: fashion.reduce((s, f) => s + ((f as any).view_count || 0), 0),
      },
      contacts: {
        total: contacts.length,
        new_count: contacts.filter(c => c.status === 'new').length,
        replied: contacts.filter(c => c.status === 'replied').length,
      },
      subscribers: {
        total: subs.length,
        active: subs.filter(s => s.status === 'active').length,
        growth: subs.filter(s => new Date(s.created_at) > new Date(since)).length,
      },
      topArticles: articlesWithViews.slice(0, 10).map(a => ({ title: a.title, views: a.view_count || 0, likes: a.like_count || 0, category: a.category || 'Uncategorized' })),
      contentByCategory: Array.from(catMap.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
    })
    setLoading(false)
  }

  const exportReport = () => {
    if (!data) return
    const lines = [
      `=== ${reportType.toUpperCase()} REPORT ===`,
      `Period: Last ${timeRange} days`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '--- CONTENT ---',
      `Articles: ${data.articles.total} (${data.articles.published} published, ${data.articles.drafts} drafts)`,
      `Article Views: ${data.articles.totalViews} (avg ${data.articles.avgViews}/article)`,
      `Projects: ${data.projects.total} (${data.projects.featured} featured)`,
      `Fashion Items: ${data.fashion.total}`,
      '',
      '--- ENGAGEMENT ---',
      `Contact Submissions: ${data.contacts.total} (${data.contacts.new_count} new, ${data.contacts.replied} replied)`,
      `Email Subscribers: ${data.subscribers.total} (${data.subscribers.active} active)`,
      `New Subscribers: +${data.subscribers.growth}`,
      '',
      '--- TOP ARTICLES ---',
      ...data.topArticles.map((a, i) => `${i + 1}. ${a.title} - ${a.views} views, ${a.likes} likes`),
      '',
      '--- CONTENT BY CATEGORY ---',
      ...data.contentByCategory.map(c => `${c.category}: ${c.count}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${reportType}-report-${timeRange}d.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Advanced Reporting</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive content and engagement reports</p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={e => setTimeRange(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button onClick={exportReport} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex gap-2">
        {reportTypes.map(r => (
          <button key={r.id} onClick={() => setReportType(r.id)} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${reportType === r.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <r.icon className="w-4 h-4" /> {r.label}
          </button>
        ))}
      </div>

      {loading ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading report...</div> : !data ? null : (
        <>
          {/* Overview Report */}
          {reportType === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'Articles', value: data.articles.total, sub: `${data.articles.published} published`, color: 'blue' },
                  { label: 'Projects', value: data.projects.total, sub: `${data.projects.featured} featured`, color: 'purple' },
                  { label: 'Fashion', value: data.fashion.total, sub: `${data.fashion.featured} featured`, color: 'pink' },
                  { label: 'Contacts', value: data.contacts.total, sub: `${data.contacts.new_count} new`, color: 'green' },
                  { label: 'Subscribers', value: data.subscribers.total, sub: `+${data.subscribers.growth} new`, color: 'amber' },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-bold mb-4">Content by Category</h3>
                  <div className="space-y-2">
                    {data.contentByCategory.map(c => (
                      <div key={c.category} className="flex items-center gap-3 text-sm">
                        <span className="flex-1">{c.category}</span>
                        <span className="font-medium">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-bold mb-4">Top Articles</h3>
                  <div className="space-y-2">
                    {data.topArticles.slice(0, 5).map((a, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="w-5 text-gray-500 dark:text-gray-400 text-xs">{i + 1}</span>
                        <span className="flex-1 truncate">{a.title}</span>
                        <span className="text-gray-500 dark:text-gray-400">{a.views} views</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Report */}
          {reportType === 'engagement' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Total Article Views', value: data.articles.totalViews.toLocaleString(), icon: Eye },
                  { label: 'Total Article Likes', value: data.articles.totalLikes.toLocaleString(), icon: TrendingUp },
                  { label: 'Avg Views/Article', value: data.articles.avgViews.toLocaleString(), icon: BarChart3 },
                  { label: 'Project Views', value: data.projects.totalViews.toLocaleString(), icon: Briefcase },
                ].map(s => (
                  <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                    <div className="flex items-center gap-3">
                      <s.icon className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="text-xl font-bold">{s.value}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold mb-4">All Articles Performance</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700"><th className="text-left py-2 font-medium">Title</th><th className="text-left py-2 font-medium">Category</th><th className="text-right py-2 font-medium">Views</th><th className="text-right py-2 font-medium">Likes</th></tr>
                  </thead>
                  <tbody>
                    {data.topArticles.map((a, i) => (
                      <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <td className="py-2 truncate max-w-[300px]">{a.title}</td>
                        <td className="py-2 text-gray-500 dark:text-gray-400">{a.category}</td>
                        <td className="py-2 text-right">{a.views}</td>
                        <td className="py-2 text-right">{a.likes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Growth Metrics */}
          {reportType === 'growth' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold text-green-600">+{data.subscribers.growth}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">New Subscribers ({timeRange}d)</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold text-blue-600">+{data.contacts.new_count}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">New Contact Submissions</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold text-purple-600">{data.subscribers.active}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Subscribers</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold mb-4">Contact Form Conversion</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1"><span>Total Submissions</span><span className="font-medium">{data.contacts.total}</span></div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1"><span>Replied</span><span className="font-medium">{data.contacts.replied}</span></div>
                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${data.contacts.total > 0 ? (data.contacts.replied / data.contacts.total * 100) : 0}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance */}
          {reportType === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold">{data.articles.published}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Published Articles</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold">{data.articles.drafts}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Draft Articles</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 text-center">
                  <div className="text-3xl font-bold">{data.articles.total > 0 ? Math.round(data.articles.published / data.articles.total * 100) : 0}%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Publication Rate</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold mb-4">Content Pipeline</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm">Published</span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${data.articles.total > 0 ? (data.articles.published / data.articles.total * 100) : 0}%` }}>
                        <span className="text-[10px] text-white font-medium">{data.articles.published}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-sm">Drafts</span>
                    <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full flex items-center justify-end pr-2" style={{ width: `${data.articles.total > 0 ? (data.articles.drafts / data.articles.total * 100) : 0}%` }}>
                        <span className="text-[10px] text-white font-medium">{data.articles.drafts}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
