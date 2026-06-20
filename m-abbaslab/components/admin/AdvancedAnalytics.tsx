'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, TrendingUp, TrendingDown, Activity, Zap, FileText, 
  Briefcase, MessageSquare, Brain, DollarSign, Users, Target,
  Calendar, ArrowUp, ArrowDown, PieChart, LineChart, RefreshCw, Database
} from 'lucide-react'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

interface AnalyticsData {
  alphas: { total: number; passed: number; failed: number; avgSharpe: number; trend: number[] }
  projects: { total: number; shipped: number; active: number; trend: number[] }
  articles: { total: number; published: number; trend: number[] }
  messages: { total: number; unread: number; trend: number[] }
  finance: { totalIncome: number; totalExpense: number; netFlow: number; trend: number[] }
  fashion: { total: number; trend: number[] }
  auditEvents: number
  engagementStreak: number
}

export default function AdvancedAnalytics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData>({
    alphas: { total: 0, passed: 0, failed: 0, avgSharpe: 0, trend: [] },
    projects: { total: 0, shipped: 0, active: 0, trend: [] },
    articles: { total: 0, published: 0, trend: [] },
    messages: { total: 0, unread: 0, trend: [] },
    finance: { totalIncome: 0, totalExpense: 0, netFlow: 0, trend: [] },
    fashion: { total: 0, trend: [] },
    auditEvents: 0,
    engagementStreak: 12,
  })
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  const fetchAnalytics = async () => {
    if (!hasSupabaseKeys) { setLoading(false); return }
    setLoading(true)

    try {
      const { count: alphaTotal } = await supabase.from('alphas').select('*', { count: 'exact', head: true })
      const { count: alphaPassed } = await supabase.from('alphas').select('*', { count: 'exact', head: true }).eq('is_passed', true)
      const { data: sharpes } = await supabase.from('alphas').select('sharpe_ratio').not('sharpe_ratio', 'is', null)
      const { data: allAlphas } = await supabase.from('alphas').select('created_at').order('created_at', { ascending: true })

      const { count: projTotal } = await supabase.from('projects').select('*', { count: 'exact', head: true })
      const { count: projShipped } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'shipped')
      const { data: allProjects } = await supabase.from('projects').select('created_at').order('created_at', { ascending: true })

      const { count: artTotal } = await supabase.from('articles').select('*', { count: 'exact', head: true })
      const { data: allArticles } = await supabase.from('articles').select('created_at').order('created_at', { ascending: true })

      const { count: msgTotal } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true })
      const { count: msgUnread } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
      const { data: allMessages } = await supabase.from('whatsapp_messages').select('created_at').order('created_at', { ascending: true })

      const { data: financeData } = await supabase.from('finance_entries').select('amount, type, date')
      const { data: allFinance } = await supabase.from('finance_entries').select('date').order('date', { ascending: true })

      const { count: fashionTotal } = await supabase.from('fashion_items').select('*', { count: 'exact', head: true })
      const { data: allFashion } = await supabase.from('fashion_items').select('created_at').order('created_at', { ascending: true })

      const { count: auditCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true })

      const avgSharpe = sharpes && sharpes.length > 0 
        ? sharpes.reduce((sum: number, a: any) => sum + (a.sharpe_ratio || 0), 0) / sharpes.length 
        : 0

      const getTrend = (items: any[], dateField: string, weeks: number) => {
        const now = Date.now()
        const weekMs = 7 * 24 * 60 * 60 * 1000
        return Array.from({ length: weeks }, (_, i) => {
          const start = now - (weeks - i) * weekMs
          const end = now - (weeks - i - 1) * weekMs
          return items.filter((item: any) => {
            const d = new Date(item[dateField]).getTime()
            return d >= start && d < end
          }).length
        })
      }

      const weeks = dateRange === '7d' ? 1 : dateRange === '30d' ? 4 : dateRange === '90d' ? 13 : 26
      const dateField = 'created_at'

      setData({
        alphas: {
          total: alphaTotal || 0,
          passed: alphaPassed || 0,
          failed: (alphaTotal || 0) - (alphaPassed || 0),
          avgSharpe,
          trend: getTrend(allAlphas || [], dateField, Math.max(weeks, 4)),
        },
        projects: {
          total: projTotal || 0,
          shipped: projShipped || 0,
          active: (projTotal || 0) - (projShipped || 0),
          trend: getTrend(allProjects || [], dateField, Math.max(weeks, 4)),
        },
        articles: {
          total: artTotal || 0,
          published: artTotal || 0,
          trend: getTrend(allArticles || [], dateField, Math.max(weeks, 4)),
        },
        messages: {
          total: msgTotal || 0,
          unread: msgUnread || 0,
          trend: getTrend(allMessages || [], dateField, Math.max(weeks, 4)),
        },
        finance: {
          totalIncome: financeData?.filter((f: any) => f.type === 'income').reduce((s: number, f: any) => s + f.amount, 0) || 0,
          totalExpense: financeData?.filter((f: any) => f.type === 'expense').reduce((s: number, f: any) => s + f.amount, 0) || 0,
          netFlow: 0,
          trend: getTrend(allFinance || [], 'date', Math.max(weeks, 4)),
        },
        fashion: {
          total: fashionTotal || 0,
          trend: getTrend(allFashion || [], dateField, Math.max(weeks, 4)),
        },
        auditEvents: auditCount || 0,
        engagementStreak: 12,
      })
    } catch (err) {
      console.error('Analytics fetch error:', err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchAnalytics() }, [dateRange])

  const finance = useMemo(() => ({
    ...data.finance,
    netFlow: data.finance.totalIncome - data.finance.totalExpense
  }), [data.finance])

  const kpiCards = [
    { label: 'Alpha Lab', value: data.alphas.total, icon: Brain, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: `${data.alphas.passed} passed / ${data.alphas.failed} failed`, change: data.alphas.avgSharpe > 1 ? `Avg Sharpe: ${data.alphas.avgSharpe.toFixed(2)}` : 'No data' },
    { label: 'Projects', value: data.projects.total, icon: Briefcase, color: 'text-purple-400', bg: 'bg-purple-500/10', sub: `${data.projects.shipped} shipped / ${data.projects.active} active`, change: null },
    { label: 'Articles', value: data.articles.total, icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10', sub: `${data.articles.published} published`, change: null },
    { label: 'WhatsApp', value: data.messages.total, icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: `${data.messages.unread} unread`, change: null },
    { label: 'Finance Net', value: `KSh ${finance.netFlow.toLocaleString()}`, icon: DollarSign, color: finance.netFlow >= 0 ? 'text-emerald-400' : 'text-red-400', bg: 'bg-amber-500/10', sub: `Income: KSh ${finance.totalIncome.toLocaleString()} / Expenses: KSh ${finance.totalExpense.toLocaleString()}`, change: null },
    { label: 'Fashion', value: data.fashion.total, icon: Users, color: 'text-pink-400', bg: 'bg-pink-500/10', sub: 'items catalogued', change: null },
    { label: 'Engagement Streak', value: `${data.engagementStreak} days`, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/10', sub: 'Keep shipping!', change: null },
    { label: 'Audit Events', value: data.auditEvents, icon: Target, color: 'text-cyan-400', bg: 'bg-cyan-500/10', sub: 'security events tracked', change: null },
  ]

  const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#00ff88' }) => {
    if (!data || data.length < 2) return null
    const max = Math.max(...data, 1)
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - (v / max) * 100}`).join(' ')
    return (
      <svg viewBox="0 0 100 100" className="w-full h-16" preserveAspectRatio="none">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polygon points={`0,100 ${pts} 100,100`} fill={`${color}22`} />
      </svg>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-400" /> Advanced Analytics
          </h2>
          <p className="text-sm text-slate-400">Real-time platform intelligence and progress tracking</p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(opt => (
            <button key={opt} onClick={() => setDateRange(opt)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${dateRange === opt ? 'bg-blue-500/20 text-blue-400 border border-gray-200 dark:border-gray-700 border-blue-500/30' : 'bg-slate-800 text-slate-400 border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-slate-600'}`}>
              {opt === 'all' ? 'ALL' : opt.toUpperCase()}
            </button>
          ))}
          <button onClick={fetchAnalytics} className="p-1.5 bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-lg hover:border-slate-600">
            <RefreshCw className={`w-4 h-4 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-400 text-center py-12">Loading analytics...</div>}

      {!loading && !hasSupabaseKeys && (
        <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700">
          <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Supabase not configured. Analytics require database connection.</p>
        </div>
      )}

      {!loading && hasSupabaseKeys && (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiCards.map((kpi, idx) => (
              <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-slate-800/80 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${kpi.bg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                  </div>
                  {kpi.change && <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">{kpi.change}</span>}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                <div className="text-xs text-slate-400">{kpi.label}</div>
                <div className="text-[10px] text-slate-400 mt-1">{kpi.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { title: 'Alpha Generation Trend', data: data.alphas.trend, icon: Brain, color: '#00ff88' },
              { title: 'Project Creation Trend', data: data.projects.trend, icon: Briefcase, color: '#a78bfa' },
              { title: 'WhatsApp Messages', data: data.messages.trend, icon: MessageSquare, color: '#34d399' },
              { title: 'Finance Activity', data: data.finance.trend, icon: DollarSign, color: '#f59e0b' },
            ].map(chart => (
              <motion.div key={chart.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/80 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <chart.icon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-white">{chart.title}</h3>
                </div>
                <Sparkline data={chart.data} color={chart.color} />
                <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                  <span>{chart.data.length} periods</span>
                  <span>Total: {chart.data.reduce((a, b) => a + b, 0)}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="bg-slate-800/80 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-amber-400" /> Platform Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Alpha Lab Completion', current: data.alphas.passed, total: Math.max(data.alphas.total, 1), color: 'bg-emerald-500' },
                { label: 'Project Ship Rate', current: data.projects.shipped, total: Math.max(data.projects.total, 1), color: 'bg-purple-500' },
                { label: 'Article Publication', current: data.articles.published, total: Math.max(data.articles.total || 25, 1), color: 'bg-blue-500' },
                { label: 'WhatsApp Response Rate', current: data.messages.total - data.messages.unread, total: Math.max(data.messages.total, 1), color: 'bg-emerald-500' },
              ].map(prog => {
                const pct = Math.round((prog.current / prog.total) * 100)
                return (
                  <div key={prog.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{prog.label}</span>
                      <span className="text-white font-bold">{pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1, delay: 0.3 }} className={`h-full rounded-full ${prog.color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
                    </div>
                    <div className="text-xs text-slate-400">{prog.current} / {prog.total} units</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-gray-200 dark:border-gray-700 border-blue-500/20 rounded-xl p-5">
              <div className="text-xs text-blue-300 uppercase tracking-wider font-bold mb-2">Alpha Efficiency</div>
              <div className="text-3xl font-bold text-white">{data.alphas.total > 0 ? `${Math.round((data.alphas.passed / data.alphas.total) * 100)}%` : 'N/A'}</div>
              <div className="text-xs text-slate-400 mt-1">Pass rate across all batches</div>
            </div>
            <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 border border-gray-200 dark:border-gray-700 border-purple-500/20 rounded-xl p-5">
              <div className="text-xs text-purple-300 uppercase tracking-wider font-bold mb-2">Project Completion</div>
              <div className="text-3xl font-bold text-white">{data.projects.total > 0 ? `${Math.round((data.projects.shipped / data.projects.total) * 100)}%` : 'N/A'}</div>
              <div className="text-xs text-slate-400 mt-1">Shipped vs total projects</div>
            </div>
            <div className="bg-gradient-to-br from-amber-900/30 to-slate-900 border border-gray-200 dark:border-gray-700 border-amber-500/20 rounded-xl p-5">
              <div className="text-xs text-amber-300 uppercase tracking-wider font-bold mb-2">Financial Health</div>
              <div className="text-3xl font-bold text-white">{finance.totalIncome > 0 ? `${Math.round((finance.netFlow / finance.totalIncome) * 100)}%` : 'N/A'}</div>
              <div className="text-xs text-slate-400 mt-1">Net profit margin</div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
