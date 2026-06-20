'use client'

import React, { useState, useEffect } from 'react'
import { Sliders, Database, Shield, Zap, FileText, Briefcase, TrendingUp, Scissors, Save, Activity, RefreshCcw } from 'lucide-react'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

const DEFAULT_CONFIG = {
  worldQuant: { autoSubmitPassed: false, riskTolerance: 0.15, backtestYears: 5 },
  finance: { defaultCurrency: 'KSh', taxRate: 16.0, savingsTargetPercent: 20 },
  content: { autoPublishToMedium: false, requireReview: true },
  fashion: { defaultSizing: 'EU', lowStockThreshold: 5 }
}

export default function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    if (hasSupabaseKeys) {
      const { data } = await supabase.from('site_config').select('*')
      if (data) {
        const merged = { ...DEFAULT_CONFIG }
        data.forEach((entry: any) => {
          if (entry.key === 'system_settings_worldquant') merged.worldQuant = { ...merged.worldQuant, ...entry.value }
          if (entry.key === 'system_settings_finance') merged.finance = { ...merged.finance, ...entry.value }
          if (entry.key === 'system_settings_content') merged.content = { ...merged.content, ...entry.value }
          if (entry.key === 'system_settings_fashion') merged.fashion = { ...merged.fashion, ...entry.value }
        })
        setConfig(merged)
      }
    }
    setLoading(false)
  }

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    setIsSaving(true)
    if (hasSupabaseKeys) {
      const entries: { key: string; value: any }[] = [
        { key: 'system_settings_worldquant', value: config.worldQuant },
        { key: 'system_settings_finance', value: config.finance },
        { key: 'system_settings_content', value: config.content },
        { key: 'system_settings_fashion', value: config.fashion },
      ]
      for (const entry of entries) {
        await supabase.from('site_config').upsert(entry, { onConflict: 'key' })
      }
      await supabase.from('audit_logs').insert({ action: 'SYSTEM_CONFIG_UPDATED', entity_type: 'settings', details: {} })
    }
    setTimeout(() => {
      setIsSaving(false)
      showToast('Global system preferences saved to database.')
    }, 500)
  }

  if (loading) {
    return <div className="bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-800 rounded-2xl p-6 text-gray-500 dark:text-gray-400">Loading configuration...</div>
  }

  return (
    <div className="bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-800 rounded-2xl p-6 shadow-sm">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border border-gray-200 dark:border-gray-700 shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-700 border-gray-800 pb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-white">
            <Sliders className="text-blue-500 w-6 h-6" />
            Global System Configuration
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Manage Core Modules</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadConfig} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 dark:text-gray-600 dark:text-gray-300 rounded-lg flex items-center gap-2">
            <RefreshCcw className="w-4 h-4" /> Reload
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50">
            {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to Database
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-500" /> WorldQuant Engine
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Auto-submit passed Alphas</span>
              <input type="checkbox" checked={config.worldQuant.autoSubmitPassed} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, autoSubmitPassed: e.target.checked } })} className="accent-blue-600" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Max Drawdown Tolerance (%)</span>
              <input type="number" step="0.01" value={config.worldQuant.riskTolerance} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, riskTolerance: parseFloat(e.target.value) } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Backtest Duration (Years)</span>
              <input type="number" value={config.worldQuant.backtestYears} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, backtestYears: parseInt(e.target.value) } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>

        <div className="bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Financial Tracker
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Default Currency</span>
              <input type="text" value={config.finance.defaultCurrency} onChange={e => setConfig({ ...config, finance: { ...config.finance, defaultCurrency: e.target.value } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Tax Rate (%)</span>
              <input type="number" step="0.1" value={config.finance.taxRate} onChange={e => setConfig({ ...config, finance: { ...config.finance, taxRate: parseFloat(e.target.value) } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Savings Target (%)</span>
              <input type="number" value={config.finance.savingsTargetPercent} onChange={e => setConfig({ ...config, finance: { ...config.finance, savingsTargetPercent: parseInt(e.target.value) } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>

        <div className="bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-blue-500" /> Content & Articles
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Auto-publish to Medium</span>
              <input type="checkbox" checked={config.content.autoPublishToMedium} onChange={e => setConfig({ ...config, content: { ...config.content, autoPublishToMedium: e.target.checked } })} className="accent-blue-600" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Require Peer Review</span>
              <input type="checkbox" checked={config.content.requireReview} onChange={e => setConfig({ ...config, content: { ...config.content, requireReview: e.target.checked } })} className="accent-blue-600" />
            </label>
          </div>
        </div>

        <div className="bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Scissors className="w-4 h-4 text-pink-500" /> Fashion Module
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Default Sizing Standard</span>
              <select value={config.fashion.defaultSizing} onChange={e => setConfig({ ...config, fashion: { ...config.fashion, defaultSizing: e.target.value } })} className="bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option value="EU">EU</option>
                <option value="US">US</option>
                <option value="UK">UK</option>
              </select>
            </label>
            <label className="flex items-center justify-between text-sm text-gray-400 dark:text-gray-600 dark:text-gray-300">
              <span>Low Stock Warning Threshold</span>
              <input type="number" value={config.fashion.lowStockThreshold} onChange={e => setConfig({ ...config, fashion: { ...config.fashion, lowStockThreshold: parseInt(e.target.value) } })} className="w-20 bg-gray-900 border border-gray-200 dark:border-gray-700 border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
