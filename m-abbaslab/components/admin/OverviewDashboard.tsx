'use client'

import React, { useState, useEffect } from 'react'
import { 
  Activity, Zap, FileText, Briefcase, BarChart, 
  MessageSquare, Server, Database, Sparkles, AlertTriangle,
  CheckCircle, ArrowRight, TrendingUp, Flame
} from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export default function OverviewDashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalAlphas: 0,
    passedAlphas: 0,
    projects: 0,
    shippedProjects: 0,
    articles: 0,
    commsSent: 0,
    financeTotal: 0,
    fashionItems: 0,
    subscribers: 0,
    messageCount: 0,
    habitStreak: 0,
    todayHabits: 0,
    todayHabitsTotal: 0,
  })
  
  const [wisdomFeed, setWisdomFeed] = useState<any[]>([])
  const [timeline, setTimeline] = useState<any[]>([])
  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hours ago`
    return `${Math.floor(hours / 24)} days ago`
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch Wisdom
        const wRes = await fetch('/api/admin/wisdom')
        if (wRes.ok) {
          const wData = await wRes.json()
          setWisdomFeed(wData.feed || [])
        }

        // Fetch Metrics via Supabase directly (fastest for simple counts)
        if (hasSupabaseKeys) {
          const [
            { count: alphaCount },
            { count: passedCount },
            { count: projectCount },
            { count: shippedCount },
            { count: articleCount },
            { data: financeData },
            { data: recentProjects },
            { data: recentArticles },
            { data: recentAlphas },
            { count: commsCount },
            { count: fashionCount },
            { count: subscriberCount },
            { count: messageCount },
            { data: disciplineDays },
          ] = await Promise.all([
            supabase.from('alphas').select('*', { count: 'exact', head: true }),
            supabase.from('alphas').select('*', { count: 'exact', head: true }).eq('is_passed', true),
            supabase.from('projects').select('*', { count: 'exact', head: true }),
            supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'shipped'),
            supabase.from('articles').select('*', { count: 'exact', head: true }),
            supabase.from('finance_entries').select('amount, type'),
            supabase.from('projects').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('articles').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('alphas').select('id, alpha_code, is_passed, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }),
            supabase.from('fashion_items').select('*', { count: 'exact', head: true }),
            supabase.from('email_subscribers').select('*', { count: 'exact', head: true }),
            supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }),
            supabase.from('discipline_days').select('date').order('date', { ascending: false }).limit(30),
          ])

          // Calculate Finance Total
          let totalFinance = 0
          if (financeData) {
            financeData.forEach((f: any) => {
              if (f.type === 'income') totalFinance += f.amount
              if (f.type === 'expense') totalFinance -= f.amount
            })
          }

          // Calculate engagement streak from discipline data
          let streak = 0
          if (disciplineDays && disciplineDays.length > 0) {
            const today = new Date()
            let checkDate = new Date(today)
            for (const day of disciplineDays) {
              const dayDate = new Date(day.date)
              const diffDays = Math.floor((checkDate.getTime() - dayDate.getTime()) / 86400000)
              if (diffDays <= 1) {
                streak++
                checkDate = dayDate
              } else if (diffDays > 1) {
                break
              }
            }
          }

          // Get today's habits
          const todayStr = new Date().toISOString().split('T')[0]
          const { data: todayHabits } = await supabase
            .from('discipline_habits')
            .select('completed')
            .eq('date', todayStr)
          const todayCompleted = todayHabits?.filter(h => h.completed).length || 0
          const todayTotal = todayHabits?.length || 0

          // Build dynamic timeline
          const allEvents: any[] = []
          if (recentProjects) {
            recentProjects.forEach((p: any) => allEvents.push({ id: p.id, action: `Project "${p.title}" created`, timeStr: p.created_at, icon: Briefcase, color: 'text-purple-400' }))
          }
          if (recentArticles) {
            recentArticles.forEach((a: any) => allEvents.push({ id: a.id, action: `Article "${a.title}" drafted`, timeStr: a.created_at, icon: FileText, color: 'text-blue-400' }))
          }
          if (recentAlphas) {
            recentAlphas.forEach((a: any) => allEvents.push({ id: a.id, action: `Alpha ${a.alpha_code} tested (${a.is_passed ? 'Passed' : 'Failed'})`, timeStr: a.created_at, icon: Zap, color: a.is_passed ? 'text-emerald-400' : 'text-red-400' }))
          }
          
          allEvents.sort((a, b) => new Date(b.timeStr).getTime() - new Date(a.timeStr).getTime())
          const formattedTimeline = allEvents.slice(0, 5).map(e => ({ ...e, time: formatTimeAgo(e.timeStr) }))
          setTimeline(formattedTimeline)

          setMetrics(prev => ({
            ...prev,
            totalAlphas: alphaCount || 0,
            passedAlphas: passedCount || 0,
            projects: projectCount || 0,
            shippedProjects: shippedCount || 0,
            articles: articleCount || 0,
            financeTotal: totalFinance,
            commsSent: commsCount || 0,
            fashionItems: fashionCount || 0,
            subscribers: subscriberCount || 0,
            messageCount: messageCount || 0,
            habitStreak: streak,
            todayHabits: todayCompleted,
            todayHabitsTotal: todayTotal,
          }))
        }
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Streaks & Greeting */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 border-blue-500/30 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Commander.</h2>
          <p className="text-blue-200 text-sm">All intelligence systems are online and awaiting your orders.</p>
        </div>
        <div className="flex items-center gap-4 bg-black/30 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 border-white/10">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <div>
              <div className="text-xs text-orange-200 font-bold uppercase tracking-wider">Engagement Streak</div>
              <div className="text-xl font-bold text-white leading-none">{loading ? '...' : `${metrics.habitStreak} Days`}</div>
            </div>
          </div>
          <div className="border-l border-white/10 pl-4">
            <div className="text-xs text-blue-200 font-bold uppercase tracking-wider">Today</div>
            <div className="text-xl font-bold text-white leading-none">{loading ? '...' : `${metrics.todayHabits}/${metrics.todayHabitsTotal}`}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Analytics Grid (Takes 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart className="w-5 h-5 text-blue-400"/> Core Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Alphas Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg"><Zap className="w-5 h-5 text-blue-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : metrics.totalAlphas}</div>
              <div className="text-sm text-slate-400 font-medium">Total Alphas Tested</div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
                <span>Passed: <strong className="text-emerald-400">{metrics.passedAlphas}</strong></span>
                <span>Failed: <strong className="text-red-400">{metrics.totalAlphas - metrics.passedAlphas}</strong></span>
              </div>
            </motion.div>

            {/* Finance Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-amber-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-amber-500/20 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : `$${metrics.financeTotal.toLocaleString()}`}</div>
              <div className="text-sm text-slate-400 font-medium">Net Cash Flow</div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
                <span>Status: <strong className={metrics.financeTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}>{metrics.financeTotal >= 0 ? 'Positive' : 'Negative'}</strong></span>
              </div>
            </motion.div>

            {/* Projects Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-purple-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg"><Briefcase className="w-5 h-5 text-purple-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : metrics.projects}</div>
              <div className="text-sm text-slate-400 font-medium">Total Projects</div>
              <div className="mt-4 pt-4 border-t border-slate-700/50 text-xs text-slate-400 flex justify-between">
                <span>Active: <strong className="text-amber-400">{metrics.projects - metrics.shippedProjects}</strong></span>
                <span>Shipped: <strong className="text-emerald-400">{metrics.shippedProjects}</strong></span>
              </div>
            </motion.div>

            {/* Articles Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-emerald-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-500/20 rounded-lg"><FileText className="w-5 h-5 text-emerald-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : metrics.articles}</div>
              <div className="text-sm text-slate-400 font-medium">Published Articles</div>
            </motion.div>

            {/* Fashion Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.25}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-pink-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-pink-500/20 rounded-lg"><Sparkles className="w-5 h-5 text-pink-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : metrics.fashionItems}</div>
              <div className="text-sm text-slate-400 font-medium">Fashion Items</div>
            </motion.div>

            {/* Subscribers Card */}
            <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} transition={{delay: 0.3}} className="bg-slate-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-cyan-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-lg"><MessageSquare className="w-5 h-5 text-cyan-400" /></div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : metrics.subscribers}</div>
              <div className="text-sm text-slate-400 font-medium">Subscribers</div>
            </motion.div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 p-6 mt-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Activity className="w-5 h-5 text-amber-400"/> Recent Activity</h3>
            {timeline.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity detected.</p>
            ) : (
              <div className="space-y-6">
                {timeline.map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id + idx} className="flex gap-4 relative">
                      {idx !== timeline.length - 1 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-700"></div>}
                      <div className={`w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shrink-0 z-10`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{item.action}</div>
                        <div className="text-xs text-slate-400">{item.time}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (Wisdom + System Health) */}
        <div className="space-y-6">
          
          {/* Wisdom Feed */}
          <div className="bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Sparkles className="w-5 h-5 text-purple-400"/> Wisdom Feed</h3>
            
            <div className="space-y-4">
              {loading ? <div className="text-sm text-slate-400">Consulting Jarvis...</div> : 
                wisdomFeed.map((item: any) => (
                  <div key={item.id} className={`p-4 rounded-lg border border-gray-200 dark:border-gray-700 ${
                    item.type === 'alert' ? 'bg-red-500/10 border-red-500/20' : 
                    item.type === 'action' ? 'bg-blue-500/10 border-blue-500/20' : 
                    'bg-slate-900 border-slate-700'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'alert' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                      {item.type === 'action' && <ArrowRight className="w-4 h-4 text-blue-400" />}
                      {item.type === 'insight' && <Sparkles className="w-4 h-4 text-purple-400" />}
                      {item.type === 'news' && <FileText className="w-4 h-4 text-slate-400" />}
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.type}</span>
                    </div>
                    <p className="text-sm text-slate-200">{item.message}</p>
                  </div>
                ))
              }
            </div>
          </div>

          {/* System Health */}
          <div className="bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 border-slate-700">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Server className="w-5 h-5 text-slate-400"/> System Health</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-white">Supabase DB</span>
                </div>
                {hasSupabaseKeys ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700">
                <div className="flex items-center gap-3">
                  <Server className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-white">Vercel Edge</span>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 border-slate-700">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-white">WhatsApp Node</span>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
