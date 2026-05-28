'use client'

import { useState, useEffect } from 'react'
import { personalConfig } from '@/config/personal'
import { motion } from 'framer-motion'
import { Shield, Activity, Database, Server, Cpu, Users, FileText, Briefcase, Lock, Brain, LayoutDashboard } from 'lucide-react'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

export default function AdminPage() {
  const [liveStats, setLiveStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'standby'>('standby')

  useEffect(() => {
    if (!hasSupabaseKeys) {
      setLoading(false)
      return
    }
    Promise.all([
      supabase.from('articles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('fashion_items').select('*', { count: 'exact', head: true }),
      supabase.from('alphas').select('*', { count: 'exact', head: true }),
      supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
      supabase.from('finance_entries').select('*', { count: 'exact', head: true }),
    ]).then(([articles, projects, fashion, alphas, messages, audit, finance]) => {
      setLiveStats({
        articles: articles.count || 0,
        projects: projects.count || 0,
        fashion: fashion.count || 0,
        alphas: alphas.count || 0,
        messages: messages.count || 0,
        audit: audit.count || 0,
        finance: finance.count || 0,
      })
      setDbStatus('connected')
      setLoading(false)
    }).catch(() => {
      setDbStatus('error')
      setLoading(false)
    })
  }, [])

  const stats = [
    { label: 'Total Articles', value: liveStats.articles ?? personalConfig.articles.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Projects', value: liveStats.projects ?? personalConfig.projects.length, icon: Briefcase, color: 'text-purple-400' },
    { label: 'Fashion Items', value: (liveStats.fashion ?? 0) || ((personalConfig as any).fashion?.titles?.length ?? 0), icon: Users, color: 'text-pink-400' },
    { label: 'Alphas Tested', value: (liveStats.alphas ?? 0) || ((personalConfig as any).worldQuant?.statistics?.totalAlphas ?? 0), icon: Brain, color: 'text-indigo-400' },
    { label: 'WhatsApp Messages', value: liveStats.messages ?? 0, icon: Activity, color: 'text-emerald-400' },
    { label: 'Audit Events', value: liveStats.audit ?? 0, icon: Lock, color: 'text-amber-400' },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/50">
              <Shield className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider">MISSION CONTROL</h1>
              <p className="text-gray-500 text-sm">System Administrator: {personalConfig.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span className={`w-2 h-2 ${dbStatus === 'connected' ? 'bg-green-500' : dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'} rounded-full animate-ping`} />
            <span>{dbStatus === 'connected' ? 'LIVE DATABASE CONNECTED' : dbStatus === 'error' ? 'DB CONNECTION ERROR' : 'LOCAL CONFIG ONLY'}</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:border-blue-500/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{loading ? '...' : stat.value}</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              System Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="flex items-center">
                  <div className={`w-2 h-2 ${dbStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-3`} />
                  <span>Supabase Database</span>
                </div>
                <span className="text-xs font-mono text-gray-500">{hasSupabaseKeys ? 'Connected' : 'No Keys'}</span>
                <span className={`px-2 py-1 text-xs rounded ${dbStatus === 'connected' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                  {dbStatus === 'connected' ? 'LIVE' : dbStatus === 'error' ? 'ERROR' : 'STANDBY'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span>3D Engine</span>
                </div>
                <span className="text-xs font-mono text-gray-500">Three.js / R3F</span>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span>JARVIS WhatsApp Engine</span>
                </div>
                <span className="text-xs font-mono text-gray-500">Port 3009</span>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Server className="w-5 h-5 mr-2 text-purple-400" />
              Quick Actions
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Monitor, manage, and deploy from the command center.
            </p>
            <div className="space-y-3">
              <a href="/" className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold">
                View Live Site
              </a>
              <a href="/admin/dashboard" className="block w-full text-center py-3 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors font-bold flex items-center justify-center gap-2">
                <LayoutDashboard className="w-5 h-5" />
                Launch Full Dashboard
              </a>
              <a href="/api/admin/migrate-data" onClick={(e) => { e.preventDefault(); fetch('/api/admin/migrate-data', { method: 'POST' }).then(r => r.json()).then(d => alert(JSON.stringify(d.results, null, 2))).catch(() => alert('Migration endpoint not available')) }}
                className="block w-full text-center py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors border border-emerald-500/30 font-semibold">
                Migrate personal.json → Supabase
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
