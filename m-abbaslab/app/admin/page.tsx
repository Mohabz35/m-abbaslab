'use client'

import { personalConfig } from '@/config/personal'
import { motion } from 'framer-motion'
import { Shield, Activity, Database, Server, Cpu, Users, FileText, Briefcase, Lock, Mail, Camera, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [dbStatus, setDbStatus] = useState<'LOADING' | 'CONNECTED' | 'DISCONNECTED'>('LOADING')
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    async function checkStatus() {
      try {
        const { count, error } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread')
        if (error) throw error
        setDbStatus('CONNECTED')
        setUnreadMessages(count || 0)
      } catch (err) {
        setDbStatus('DISCONNECTED')
      }
    }
    checkStatus()
  }, [])

  const stats = [
    { label: 'Total Articles', value: personalConfig.articles.length, icon: FileText, color: 'text-blue-400' },
    { label: 'Projects', value: personalConfig.projects.length, icon: Briefcase, color: 'text-purple-400' },
    { label: 'Unread Messages', value: unreadMessages, icon: Mail, color: unreadMessages > 0 ? 'text-red-400' : 'text-green-400' },
    { label: 'System Status', value: 'Online', icon: Activity, color: 'text-green-400' },
  ]

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono relative overflow-hidden">
      {/* Background Matrix Effect */}
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
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span>SECURE CONNECTION ESTABLISHED</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-sm hover:border-blue-500/30 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <Activity className="w-4 h-4 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* System Logs / Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Database className="w-5 h-5 mr-2 text-blue-400" />
              Content Config Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  <span>Personal Configuration</span>
                </div>
                <span className="text-xs font-mono text-gray-500">config/personal.ts</span>
                <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded">SYNCED</span>
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
                  <div className={`w-2 h-2 rounded-full mr-3 ${dbStatus === 'CONNECTED' ? 'bg-green-500' :
                      dbStatus === 'DISCONNECTED' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                  <span>Database Connection</span>
                </div>
                <span className="text-xs font-mono text-gray-500">Supabase</span>
                <span className={`px-2 py-1 text-xs rounded ${dbStatus === 'CONNECTED' ? 'bg-green-500/10 text-green-400' :
                    dbStatus === 'DISCONNECTED' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>
                  {dbStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <Server className="w-5 h-5 mr-2 text-purple-400" />
              Quick Actions
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              To update content, edit the configuration files directly. The platform will auto-deploy changes.
            </p>
            <div className="space-y-3">
              <Link href="/" className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold">
                View Live Site
              </Link>
              <Link href="/admin/messages" className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 text-[#00f0ff] rounded-lg transition-colors border border-[#00f0ff]/30 flex items-center justify-center">
                <Mail className="w-4 h-4 mr-2" />
                Message Center ({unreadMessages})
              </Link>
              <Link href="/admin/gallery" className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 text-pink-400 rounded-lg transition-colors border border-pink-500/30 flex items-center justify-center">
                <Camera className="w-4 h-4 mr-2" />
                Virtual Gallery Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
