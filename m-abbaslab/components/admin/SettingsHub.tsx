'use client'

import React, { useState, useEffect } from 'react'
import {
  Settings, Zap, BarChart, FileText, Briefcase, MessageSquare,
  Bell, Globe, Shield, Save, ChevronDown, ChevronRight,
  CheckCircle, Server, Database, Phone, Sliders, Key, History,
  User, Activity, RefreshCcw, Palette, Scissors
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppConnectionPanel from './WhatsAppConnectionPanel'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

interface ModuleConfig {
  id: string
  label: string
  icon: any
  color: string
  settings: { key: string; label: string; type: 'text' | 'number' | 'toggle' | 'select'; value: any; options?: string[]; description: string }[]
}

const defaultModules: ModuleConfig[] = [
  {
    id: 'alpha-lab',
    label: 'Alpha Lab (World Quant)',
    icon: Zap,
    color: 'emerald',
    settings: [
      { key: 'minSharpe', label: 'Minimum Sharpe Ratio', type: 'number', value: 1.5, description: 'Alphas must exceed this Sharpe to pass' },
      { key: 'maxDrawdown', label: 'Max Drawdown (%)', type: 'number', value: 15, description: 'Maximum allowed drawdown percentage' },
      { key: 'minWinRate', label: 'Min Win Rate (%)', type: 'number', value: 52, description: 'Minimum win rate to pass criteria' },
      { key: 'maxTurnover', label: 'Max Turnover', type: 'number', value: 0.5, description: 'Maximum portfolio turnover ratio' },
      { key: 'defaultBatchSize', label: 'Default Batch Size', type: 'number', value: 10, description: 'Number of alphas generated per batch' },
    ]
  },
  {
    id: 'content-scheduler',
    label: 'Content Scheduler',
    icon: FileText,
    color: 'blue',
    settings: [
      { key: 'defaultPlatform', label: 'Default Platform', type: 'select', value: 'twitter', options: ['twitter', 'linkedin', 'instagram', 'tiktok'], description: 'Default platform for new posts' },
      { key: 'autoSchedule', label: 'Auto-Schedule Posts', type: 'toggle', value: false, description: 'Automatically schedule posts at optimal times' },
      { key: 'aiGenerate', label: 'AI Content Generation', type: 'toggle', value: true, description: 'Enable AI-assisted content generation' },
    ]
  },
  {
    id: 'finance',
    label: 'Finance Tracker',
    icon: BarChart,
    color: 'amber',
    settings: [
      { key: 'currency', label: 'Currency', type: 'select', value: 'KES', options: ['USD', 'KES', 'EUR', 'GBP'], description: 'Default currency for transactions' },
      { key: 'taxRate', label: 'Tax Rate (%)', type: 'number', value: 16, description: 'Default tax rate percentage' },
      { key: 'savingsTarget', label: 'Savings Target (%)', type: 'number', value: 20, description: 'Monthly savings target percentage' },
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: Briefcase,
    color: 'purple',
    settings: [
      { key: 'defaultStatus', label: 'Default Status', type: 'select', value: 'In Progress', options: ['In Progress', 'Planning', 'On Hold', 'Completed'], description: 'Status assigned to new projects' },
      { key: 'showOnPortfolio', label: 'Show on Portfolio', type: 'toggle', value: true, description: 'Display new projects on public portfolio by default' },
    ]
  },
  {
    id: 'fashion',
    label: 'Fashion Module',
    icon: Scissors,
    color: 'pink',
    settings: [
      { key: 'defaultSizing', label: 'Default Sizing Standard', type: 'select', value: 'EU', options: ['EU', 'US', 'UK'], description: 'Default sizing standard for fashion items' },
      { key: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number', value: 5, description: 'Stock level that triggers low inventory warning' },
    ]
  },
]

const DEFAULT_SYSTEM_CONFIG = {
  worldQuant: { autoSubmitPassed: false, riskTolerance: 0.15, backtestYears: 5 },
  finance: { defaultCurrency: 'KSh', taxRate: 16.0, savingsTargetPercent: 20 },
  content: { autoPublishToMedium: false, requireReview: true },
  fashion: { defaultSizing: 'EU', lowStockThreshold: 5 }
}

export default function SettingsHub() {
  const [activeTab, setActiveTab] = useState<string>('system')
  const [modules, setModules] = useState(defaultModules)
  const [expandedModule, setExpandedModule] = useState<string | null>('alpha-lab')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // System config
  const [systemConfig, setSystemConfig] = useState(DEFAULT_SYSTEM_CONFIG)
  const [sysLoading, setSysLoading] = useState(true)

  // Security state
  const [displayName, setDisplayName] = useState('M. Abbas')
  const [bio, setBio] = useState('Chief Executive Officer. Architecting System 12×.')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [auditLoading, setAuditLoading] = useState(false)

  useEffect(() => {
    loadSystemConfig()
    loadModuleSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'audit') fetchAuditLogs()
  }, [activeTab])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // --- System Config ---
  const loadSystemConfig = async () => {
    setSysLoading(true)
    if (hasSupabaseKeys) {
      const { data } = await supabase.from('site_config').select('*')
      if (data) {
        const merged = { ...DEFAULT_SYSTEM_CONFIG }
        data.forEach((entry: any) => {
          if (entry.key === 'system_settings_worldquant') merged.worldQuant = { ...merged.worldQuant, ...entry.value }
          if (entry.key === 'system_settings_finance') merged.finance = { ...merged.finance, ...entry.value }
          if (entry.key === 'system_settings_content') merged.content = { ...merged.content, ...entry.value }
          if (entry.key === 'system_settings_fashion') merged.fashion = { ...merged.fashion, ...entry.value }
        })
        setSystemConfig(merged)
      }
    }
    setSysLoading(false)
  }

  const handleSaveSystem = async () => {
    setSaving(true)
    if (hasSupabaseKeys) {
      const entries = [
        { key: 'system_settings_worldquant', value: systemConfig.worldQuant },
        { key: 'system_settings_finance', value: systemConfig.finance },
        { key: 'system_settings_content', value: systemConfig.content },
        { key: 'system_settings_fashion', value: systemConfig.fashion },
      ]
      for (const entry of entries) {
        await supabase.from('site_config').upsert(entry as any, { onConflict: 'key' })
      }
      await supabase.from('audit_logs').insert({ action: 'SYSTEM_CONFIG_UPDATED', entity_type: 'settings', details: {} })
    }
    setSaving(false)
    showToast('Global system preferences saved to database.')
  }

  // --- Module Settings ---
  const loadModuleSettings = async () => {
    try {
      const res = await fetch('/api/admin/config')
      if (res.ok) {
        const config = await res.json()
        if (config.settingsHub) {
          setModules(prev => prev.map(mod => {
            const saved = config.settingsHub[mod.id]
            if (!saved) return mod
            return { ...mod, settings: mod.settings.map(s => ({ ...s, value: saved[s.key] !== undefined ? saved[s.key] : s.value })) }
          }))
        }
      }
    } catch {
      const saved = localStorage.getItem('admin_settings_hub')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setModules(prev => prev.map(mod => {
            const sMod = parsed[mod.id]
            if (!sMod) return mod
            return { ...mod, settings: mod.settings.map(s => ({ ...s, value: sMod[s.key] !== undefined ? sMod[s.key] : s.value })) }
          }))
        } catch {}
      }
    }
  }

  const updateSetting = (moduleId: string, key: string, value: any) => {
    setHasChanges(true)
    setModules(prev => prev.map(mod =>
      mod.id !== moduleId ? mod : { ...mod, settings: mod.settings.map(s => s.key === key ? { ...s, value } : s) }
    ))
  }

  const handleSaveModules = async () => {
    setSaving(true)
    const settingsHub: Record<string, Record<string, any>> = {}
    modules.forEach(mod => {
      settingsHub[mod.id] = {}
      mod.settings.forEach(s => { settingsHub[mod.id][s.key] = s.value })
    })
    localStorage.setItem('admin_settings_hub', JSON.stringify(settingsHub))
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settingsHub })
      })
    } catch {}
    setSaving(false)
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 3000)
  }

  // --- Security ---
  const fetchAuditLogs = async () => {
    setAuditLoading(true)
    if (hasSupabaseKeys) {
      const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20)
      if (data) setAuditLogs(data)
    }
    setAuditLoading(false)
  }

  const handleUpdateProfile = async () => {
    setSaving(true)
    if (hasSupabaseKeys) {
      await supabase.from('site_config').upsert({ key: 'profile', value: { displayName, bio } } as any, { onConflict: 'key' })
      await supabase.from('audit_logs').insert({ action: 'PROFILE_UPDATED', entity_type: 'profile', details: { displayName } })
    }
    setSaving(false)
    showToast('Profile biography updated successfully.')
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) { showToast('Passwords do not match.', 'error'); return }
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return }
    setSaving(true)
    if (hasSupabaseKeys) {
      await supabase.from('site_config').upsert({ key: 'admin_credentials', value: { password: newPassword } } as any, { onConflict: 'key' })
      await supabase.from('audit_logs').insert({ action: 'PASSWORD_CHANGED', entity_type: 'security', details: {} })
    }
    setSaving(false)
    setNewPassword(''); setConfirmPassword('')
    showToast('Security credentials updated.')
  }

  const tabs = [
    { id: 'system', label: 'System', icon: Sliders },
    { id: 'modules', label: 'Modules', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'audit', label: 'Audit Log', icon: History },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: 'bg-blue-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: 'bg-amber-500/20' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'bg-purple-500/20' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: 'bg-cyan-500/20' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: 'bg-green-500/20' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: 'bg-red-500/20' },
      pink: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20', icon: 'bg-pink-500/20' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            Settings Hub
          </h2>
          <p className="text-slate-400 text-sm mt-1">System configuration, security, and module settings</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'system' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                <Sliders className="text-blue-500 w-6 h-6" />
                Global System Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Manage Core Modules</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadSystemConfig} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 text-sm">
                <RefreshCcw className="w-4 h-4" /> Reload
              </button>
              <button onClick={handleSaveSystem} disabled={saving} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm">
                {saving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>
          </div>

          {sysLoading ? (
            <div className="text-slate-400">Loading configuration...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4 text-emerald-500" /> WorldQuant Engine
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Auto-submit passed Alphas</span>
                    <input type="checkbox" checked={systemConfig.worldQuant.autoSubmitPassed} onChange={e => setSystemConfig({ ...systemConfig, worldQuant: { ...systemConfig.worldQuant, autoSubmitPassed: e.target.checked } })} className="accent-blue-600" />
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Max Drawdown Tolerance (%)</span>
                    <input type="number" step="0.01" value={systemConfig.worldQuant.riskTolerance} onChange={e => setSystemConfig({ ...systemConfig, worldQuant: { ...systemConfig.worldQuant, riskTolerance: parseFloat(e.target.value) } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Backtest Duration (Years)</span>
                    <input type="number" value={systemConfig.worldQuant.backtestYears} onChange={e => setSystemConfig({ ...systemConfig, worldQuant: { ...systemConfig.worldQuant, backtestYears: parseInt(e.target.value) } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <BarChart className="w-4 h-4 text-amber-500" /> Financial Tracker
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Default Currency</span>
                    <input type="text" value={systemConfig.finance.defaultCurrency} onChange={e => setSystemConfig({ ...systemConfig, finance: { ...systemConfig.finance, defaultCurrency: e.target.value } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Tax Rate (%)</span>
                    <input type="number" step="0.1" value={systemConfig.finance.taxRate} onChange={e => setSystemConfig({ ...systemConfig, finance: { ...systemConfig.finance, taxRate: parseFloat(e.target.value) } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Savings Target (%)</span>
                    <input type="number" value={systemConfig.finance.savingsTargetPercent} onChange={e => setSystemConfig({ ...systemConfig, finance: { ...systemConfig.finance, savingsTargetPercent: parseInt(e.target.value) } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <FileText className="w-4 h-4 text-blue-500" /> Content & Articles
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Auto-publish to Medium</span>
                    <input type="checkbox" checked={systemConfig.content.autoPublishToMedium} onChange={e => setSystemConfig({ ...systemConfig, content: { ...systemConfig.content, autoPublishToMedium: e.target.checked } })} className="accent-blue-600" />
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Require Peer Review</span>
                    <input type="checkbox" checked={systemConfig.content.requireReview} onChange={e => setSystemConfig({ ...systemConfig, content: { ...systemConfig.content, requireReview: e.target.checked } })} className="accent-blue-600" />
                  </label>
                </div>
              </div>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <Scissors className="w-4 h-4 text-pink-500" /> Fashion Module
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Default Sizing Standard</span>
                    <select value={systemConfig.fashion.defaultSizing} onChange={e => setSystemConfig({ ...systemConfig, fashion: { ...systemConfig.fashion, defaultSizing: e.target.value } })} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white">
                      <option value="EU">EU</option>
                      <option value="US">US</option>
                      <option value="UK">UK</option>
                    </select>
                  </label>
                  <label className="flex items-center justify-between text-sm text-slate-300">
                    <span>Low Stock Warning Threshold</span>
                    <input type="number" value={systemConfig.fashion.lowStockThreshold} onChange={e => setSystemConfig({ ...systemConfig, fashion: { ...systemConfig.fashion, lowStockThreshold: parseInt(e.target.value) } })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 outline-none focus:border-blue-500 text-white" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">Configure individual module behavior</p>
            <button
              onClick={handleSaveModules}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-sm transition-all ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : hasChanges
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              ) : saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved!</>
              ) : (
                <><Save className="w-4 h-4" /> Save All</>
              )}
            </button>
          </div>
          {modules.map(mod => {
            const Icon = mod.icon
            const cc = getColorClasses(mod.color)
            const isExpanded = expandedModule === mod.id
            return (
              <div key={mod.id} className={`rounded-xl border border-slate-700 bg-slate-800 overflow-hidden transition-all ${isExpanded ? `shadow-lg ${cc.border}` : ''}`}>
                <button
                  onClick={() => setExpandedModule(isExpanded ? null : mod.id)}
                  className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${isExpanded ? cc.bg : 'hover:bg-slate-700/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cc.icon}`}>
                      <Icon className={`w-5 h-5 ${cc.text}`} />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-sm">{mod.label}</div>
                      <div className="text-xs text-slate-500">{mod.settings.length} settings</div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="px-5 pb-5 space-y-4 border-t border-slate-700/50">
                        {mod.settings.map(setting => (
                          <div key={setting.key} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-0">
                            <div className="flex-1 mr-4">
                              <div className="text-sm font-medium text-white">{setting.label}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{setting.description}</div>
                            </div>
                            <div className="shrink-0">
                              {setting.type === 'toggle' ? (
                                <button
                                  onClick={() => updateSetting(mod.id, setting.key, !setting.value)}
                                  className={`relative w-12 h-6 rounded-full transition-colors ${setting.value ? 'bg-emerald-600' : 'bg-slate-600'}`}
                                >
                                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${setting.value ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                              ) : setting.type === 'select' ? (
                                <select value={setting.value} onChange={e => updateSetting(mod.id, setting.key, e.target.value)} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white outline-none">
                                  {setting.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : (
                                <input
                                  type={setting.type === 'number' ? 'number' : 'text'}
                                  value={setting.value}
                                  onChange={e => updateSetting(mod.id, setting.key, setting.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                  step={setting.type === 'number' ? 0.1 : undefined}
                                  className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white w-24 text-right outline-none"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" /> Core Identity
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">System Biography</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none resize-none" />
              </div>
              <button onClick={handleUpdateProfile} disabled={saving} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm">
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Identity
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> Change Master Password
            </h3>
            <p className="text-xs text-slate-500 mb-6">Updating this will revoke all existing admin sessions.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-amber-500 outline-none" />
              </div>
              <button onClick={handleChangePassword} disabled={saving || !newPassword} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 text-sm">
                {saving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Update Credentials
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" />
              WhatsApp Connection
            </h3>
            <WhatsAppConnectionPanel />
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" /> System Event Logs
            </h3>
            <button onClick={fetchAuditLogs} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1">
              <RefreshCcw className={`w-3 h-3 ${auditLoading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-bold">Timestamp</th>
                  <th className="pb-3 font-bold">Action Event</th>
                  <th className="pb-3 font-bold">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {auditLogs.length === 0 && !auditLoading && (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-500">No audit events yet.</td></tr>
                )}
                {auditLoading && <tr><td colSpan={3} className="py-8 text-center text-slate-500">Loading...</td></tr>}
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400 font-mono text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="py-3 text-cyan-400 font-bold tracking-wide">{log.action}</td>
                    <td className="py-3 text-slate-500 font-mono text-xs">{log.entity_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}