'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, Zap, BarChart, Briefcase, FileText, MessageSquare,
  Bell, Globe, Shield, Palette, Save, ChevronDown, ChevronRight,
  CheckCircle, AlertTriangle, Server, Database, Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WhatsAppConnectionPanel from './WhatsAppConnectionPanel'

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
      { key: 'whatsappOnPass', label: 'WhatsApp on Alpha Pass', type: 'toggle', value: true, description: 'Send WhatsApp notification when an alpha passes all criteria' },
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
      { key: 'currency', label: 'Currency', type: 'select', value: 'USD', options: ['USD', 'KES', 'EUR', 'GBP'], description: 'Default currency for transactions' },
      { key: 'fiscalYearStart', label: 'Fiscal Year Start', type: 'select', value: 'January', options: ['January', 'April', 'July', 'October'], description: 'Month when fiscal year begins' },
      { key: 'autoCategorize', label: 'Auto-Categorize Transactions', type: 'toggle', value: true, description: 'Use AI to automatically categorize imported transactions' },
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
    id: 'articles',
    label: 'Articles & Research',
    icon: FileText,
    color: 'cyan',
    settings: [
      { key: 'autoPublish', label: 'Auto-Publish Drafts', type: 'toggle', value: false, description: 'Automatically publish articles when marked complete' },
      { key: 'enableComments', label: 'Enable Comments', type: 'toggle', value: true, description: 'Allow comments on published articles' },
    ]
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp & Notifications',
    icon: MessageSquare,
    color: 'green',
    settings: [
      { key: 'notifyAlphaPass', label: 'Notify on Alpha Pass', type: 'toggle', value: true, description: 'Send WhatsApp when an alpha passes World Quant criteria' },
      { key: 'notifyBatchComplete', label: 'Notify on Batch Complete', type: 'toggle', value: true, description: 'Send WhatsApp when a generation batch finishes' },
      { key: 'notifySystemAlerts', label: 'System Alert Notifications', type: 'toggle', value: true, description: 'Send WhatsApp for critical system alerts' },
    ]
  },
  {
    id: 'system',
    label: 'System & Security',
    icon: Shield,
    color: 'red',
    settings: [
      { key: 'sessionTimeout', label: 'Session Timeout (min)', type: 'number', value: 60, description: 'Admin session timeout in minutes' },
      { key: 'auditLogging', label: 'Audit Logging', type: 'toggle', value: true, description: 'Log all admin actions for audit trail' },
    ]
  },
]

export default function SettingsHub() {
  const [modules, setModules] = useState(defaultModules)
  const [expandedModule, setExpandedModule] = useState<string | null>('alpha-lab')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/config')
        if (res.ok) {
          const config = await res.json()
          if (config.settingsHub) {
            setModules(prev => prev.map(mod => {
              const saved = config.settingsHub[mod.id]
              if (!saved) return mod
              return {
                ...mod,
                settings: mod.settings.map(s => ({
                  ...s,
                  value: saved[s.key] !== undefined ? saved[s.key] : s.value
                }))
              }
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
              return {
                ...mod,
                settings: mod.settings.map(s => ({
                  ...s,
                  value: sMod[s.key] !== undefined ? sMod[s.key] : s.value
                }))
              }
            }))
          } catch {}
        }
      }
    }
    loadSettings()
  }, [])

  const updateSetting = (moduleId: string, key: string, value: any) => {
    setHasChanges(true)
    setModules(prev => prev.map(mod => {
      if (mod.id !== moduleId) return mod
      return {
        ...mod,
        settings: mod.settings.map(s => s.key === key ? { ...s, value } : s)
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const settingsHub: Record<string, Record<string, any>> = {}
    modules.forEach(mod => {
      settingsHub[mod.id] = {}
      mod.settings.forEach(s => {
        settingsHub[mod.id][s.key] = s.value
      })
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

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: 'bg-emerald-500/20' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', icon: 'bg-blue-500/20' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: 'bg-amber-500/20' },
      purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: 'bg-purple-500/20' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', icon: 'bg-cyan-500/20' },
      green: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20', icon: 'bg-green-500/20' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', icon: 'bg-red-500/20' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            Settings Hub
          </h2>
          <p className="text-slate-400 text-sm mt-1">Configure every module in your system</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
            saved
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : hasChanges
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed shadow-none'
          }`}
        >
          {saving ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
          ) : saved ? (
            <><CheckCircle className="w-4 h-4" /> Saved!</>
          ) : (
            <><Save className="w-4 h-4" /> Save All Settings</>
          )}
        </button>
      </div>

      {/* WhatsApp Connection (always visible) */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-400" />
          WhatsApp Connection
        </h3>
        <WhatsAppConnectionPanel />
      </div>

      {/* Module Settings */}
      <div className="space-y-3">
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
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
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
                              <select
                                value={setting.value}
                                onChange={e => updateSetting(mod.id, setting.key, e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                              >
                                {setting.options?.map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : setting.type === 'number' ? (
                              <input
                                type="number"
                                value={setting.value}
                                onChange={e => updateSetting(mod.id, setting.key, parseFloat(e.target.value) || 0)}
                                step={setting.key.includes('Rate') || setting.key.includes('Drawdown') || setting.key.includes('Turnover') || setting.key.includes('Sharpe') ? 0.1 : 1}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white w-24 text-right focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                            ) : (
                              <input
                                type="text"
                                value={setting.value}
                                onChange={e => updateSetting(mod.id, setting.key, e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white w-48 focus:ring-2 focus:ring-blue-500 outline-none"
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
    </div>
  )
}
