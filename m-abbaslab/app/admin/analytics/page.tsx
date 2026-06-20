'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  BarChart3, TrendingUp, Eye, Users, Clock, Globe,
  Monitor, Smartphone, Tablet, ArrowUp, ArrowDown,
  Calendar, Download, RefreshCcw, Filter
} from 'lucide-react'

type AnalyticsSummary = {
  totalViews: number
  uniqueVisitors: number
  avgLoadTime: number
  avgTimeOnPage: number
  topPages: { path: string; title: string; views: number; avg_time: number }[]
  deviceBreakdown: { device: string; count: number }[]
  browserBreakdown: { browser: string; count: number }[]
  dailyViews: { date: string; views: number; visitors: number }[]
  referrerSources: { referrer: string; count: number }[]
  countryBreakdown: { country: string; count: number }[]
}

const timeRanges = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'All time', days: 365 },
]

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setLoading(true)
    const since = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000).toISOString()

    const [analyticsRes, articlesRes, projectsRes] = await Promise.all([
      supabase.from('analytics_events').select('*').gte('created_at', since),
      supabase.from('articles').select('id, title, view_count, like_count').order('view_count', { ascending: false }).limit(10),
      supabase.from('projects').select('id, title, view_count').order('view_count', { ascending: false }).limit(10),
    ])

    const rows = analyticsRes.data || []

    // Aggregate
    const totalViews = rows.length
    const uniqueVisitors = new Set(rows.map(r => r.visitor_id).filter(Boolean)).size || totalViews
    const avgLoadTime = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.load_time_ms || 0), 0) / rows.length) : 0
    const avgTimeOnPage = rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.time_on_page_sec || 0), 0) / rows.length) : 0

    // Top pages
    const pageMap = new Map<string, { path: string; title: string; views: number; total_time: number }>()
    rows.forEach(r => {
      const existing = pageMap.get(r.page_path)
      if (existing) {
        existing.views++
        existing.total_time += r.time_on_page_sec || 0
      } else {
        pageMap.set(r.page_path, { path: r.page_path, title: r.page_title || r.page_path, views: 1, total_time: r.time_on_page_sec || 0 })
      }
    })
    const topPages = Array.from(pageMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(p => ({ ...p, avg_time: p.views > 0 ? Math.round(p.total_time / p.views) : 0 }))

    // Device breakdown
    const deviceMap = new Map<string, number>()
    rows.forEach(r => { const d = r.device_type || 'unknown'; deviceMap.set(d, (deviceMap.get(d) || 0) + 1) })
    const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({ device, count })).sort((a, b) => b.count - a.count)

    // Browser breakdown
    const browserMap = new Map<string, number>()
    rows.forEach(r => { const b = r.browser || 'unknown'; browserMap.set(b, (browserMap.get(b) || 0) + 1) })
    const browserBreakdown = Array.from(browserMap.entries()).map(([browser, count]) => ({ browser, count })).sort((a, b) => b.count - a.count).slice(0, 8)

    // Daily views
    const dailyMap = new Map<string, { views: number; visitors: Set<string> }>()
    rows.forEach(r => {
      const date = r.created_at.split('T')[0]
      const existing = dailyMap.get(date)
      if (existing) {
        existing.views++
        if (r.visitor_id) existing.visitors.add(r.visitor_id)
      } else {
        dailyMap.set(date, { views: 1, visitors: new Set(r.visitor_id ? [r.visitor_id] : []) })
      }
    })
    const dailyViews = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, views: d.views, visitors: d.visitors.size }))

    // Referrer sources
    const refMap = new Map<string, number>()
    rows.forEach(r => { const ref = r.referrer || 'Direct'; refMap.set(ref, (refMap.get(ref) || 0) + 1) })
    const referrerSources = Array.from(refMap.entries()).map(([referrer, count]) => ({ referrer, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // Country breakdown
    const countryMap = new Map<string, number>()
    rows.forEach(r => { const c = r.country || 'Unknown'; countryMap.set(c, (countryMap.get(c) || 0) + 1) })
    const countryBreakdown = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    setData({
      totalViews, uniqueVisitors, avgLoadTime, avgTimeOnPage,
      topPages, deviceBreakdown, browserBreakdown, dailyViews,
      referrerSources, countryBreakdown,
    })
    setLoading(false)
  }

  const exportReport = () => {
    if (!data) return
    const lines = [
      `Analytics Report - Last ${timeRange} days`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Views: ${data.totalViews}`,
      `Unique Visitors: ${data.uniqueVisitors}`,
      `Avg Load Time: ${data.avgLoadTime}ms`,
      `Avg Time on Page: ${data.avgTimeOnPage}s`,
      '',
      'Top Pages:',
      ...data.topPages.map(p => `  ${p.path} - ${p.views} views, ${p.avg_time}s avg`),
      '',
      'Device Breakdown:',
      ...data.deviceBreakdown.map(d => `  ${d.device}: ${d.count}`),
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `analytics-report-${timeRange}d.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const deviceIcon = (device: string) => {
    switch (device) {
      case 'desktop': return <Monitor className="w-4 h-4" />
      case 'mobile': return <Smartphone className="w-4 h-4" />
      case 'tablet': return <Tablet className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const maxDailyViews = data ? Math.max(...data.dailyViews.map(d => d.views), 1) : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Site traffic and engagement metrics</p>
        </div>
        <div className="flex gap-2">
          <select value={timeRange} onChange={e => setTimeRange(Number(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
            {timeRanges.map(r => <option key={r.days} value={r.days}>{r.label}</option>)}
          </select>
          <button onClick={exportReport} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading analytics...</div>
      ) : !data ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-600 dark:text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No analytics data yet</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Data will appear as visitors browse your site</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: data.totalViews.toLocaleString(), icon: Eye, color: 'blue' },
              { label: 'Unique Visitors', value: data.uniqueVisitors.toLocaleString(), icon: Users, color: 'green' },
              { label: 'Avg Load Time', value: `${data.avgLoadTime}ms`, icon: Clock, color: 'amber' },
              { label: 'Avg Time on Page', value: `${data.avgTimeOnPage}s`, icon: TrendingUp, color: 'purple' },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${s.color}-50 flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 text-${s.color}-500`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Views Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold mb-4">Daily Views</h3>
            <div className="flex items-end gap-1 h-40">
              {data.dailyViews.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                    style={{ height: `${(d.views / maxDailyViews) * 100}%`, minHeight: d.views > 0 ? 4 : 0 }}
                    title={`${d.date}: ${d.views} views`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-gray-500 dark:text-gray-400">
              {data.dailyViews.length > 0 && <span>{data.dailyViews[0]?.date}</span>}
              {data.dailyViews.length > 1 && <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4">Top Pages</h3>
              <div className="space-y-2">
                {data.topPages.slice(0, 8).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-gray-500 dark:text-gray-400 text-xs">{i + 1}</span>
                    <span className="flex-1 truncate font-medium">{p.path}</span>
                    <span className="text-gray-500 dark:text-gray-400">{p.views} views</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{p.avg_time}s</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4">Device Breakdown</h3>
              <div className="space-y-3">
                {data.deviceBreakdown.map(d => {
                  const pct = data.totalViews > 0 ? Math.round((d.count / data.totalViews) * 100) : 0
                  return (
                    <div key={d.device} className="flex items-center gap-3">
                      {deviceIcon(d.device)}
                      <span className="w-20 text-sm capitalize">{d.device}</span>
                      <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Browser Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4">Browsers</h3>
              <div className="space-y-2">
                {data.browserBreakdown.map(b => {
                  const pct = data.totalViews > 0 ? Math.round((b.count / data.totalViews) * 100) : 0
                  return (
                    <div key={b.browser} className="flex items-center gap-3 text-sm">
                      <span className="flex-1">{b.browser}</span>
                      <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-12 text-right text-gray-500 dark:text-gray-400">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Referrer Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4">Traffic Sources</h3>
              <div className="space-y-2">
                {data.referrerSources.slice(0, 8).map(r => (
                  <div key={r.referrer} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate">{r.referrer}</span>
                    <span className="text-gray-500 dark:text-gray-400">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Country Breakdown */}
          {data.countryBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4">Geographic Distribution</h3>
              <div className="grid grid-cols-5 gap-3">
                {data.countryBreakdown.map(c => (
                  <div key={c.country} className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="font-bold">{c.count}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.country}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
