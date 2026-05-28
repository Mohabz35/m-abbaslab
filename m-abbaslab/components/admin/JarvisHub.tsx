'use client'

import React, { useState } from 'react'
import { Sparkles, Brain, Inbox, Zap, Settings, Activity } from 'lucide-react'
import JarvisAdvanced from './JarvisAdvanced'
import JarvisBrain from './JarvisBrain'
import JarvisLearning from './JarvisLearning'
import JarvisInbox from './JarvisInbox'

export default function JarvisHub() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'advanced' | 'brain' | 'learning'>('inbox')

  const tabs = [
    { id: 'inbox', label: 'Priority Inbox', icon: Inbox },
    { id: 'advanced', label: 'Groups & Status', icon: Zap },
    { id: 'brain', label: 'Knowledge Base', icon: Brain },
    { id: 'learning', label: 'Training Rules', icon: Settings },
  ] as const

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-8 rounded-2xl border border-purple-500/30 flex justify-between items-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-x-1/3 -translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            J.A.R.V.I.S. Core
          </h2>
          <p className="text-purple-200 text-sm max-w-xl">
            Centralized artificial intelligence control hub. Manage knowledge parameters, monitor group activities, review training logs, and process inbox items.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-black/30 px-6 py-4 rounded-xl border border-white/10 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <div>
              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider">Engine Status</div>
              <div className="text-lg font-bold text-white leading-none mt-1">ONLINE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-700/50 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                isActive 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20 border border-purple-500' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'inbox' && <JarvisInbox />}
        {activeTab === 'advanced' && <JarvisAdvanced />}
        {activeTab === 'brain' && <JarvisBrain rules={[]} onChange={() => {}} />}
        {activeTab === 'learning' && <JarvisLearning />}
      </div>
    </div>
  )
}
