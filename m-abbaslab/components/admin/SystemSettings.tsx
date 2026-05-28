'use client'

import React, { useState } from 'react'
import { Sliders, Database, Shield, Zap, FileText, Briefcase, TrendingUp, Scissors, Save, Activity } from 'lucide-react'

export default function SystemSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [config, setConfig] = useState({
    worldQuant: {
      autoSubmitPassed: false,
      riskTolerance: 0.15,
      backtestYears: 5
    },
    finance: {
      defaultCurrency: 'KSh',
      taxRate: 16.0,
      savingsTargetPercent: 20
    },
    content: {
      autoPublishToMedium: false,
      requireReview: true
    },
    fashion: {
      defaultSizing: 'EU',
      lowStockThreshold: 5
    }
  })

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      showToast('Global system preferences updated successfully.')
    }, 800)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/80 dark:border-red-900 dark:text-red-200' : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-150 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Sliders className="text-blue-500 w-6 h-6" />
            Global System Configuration
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Manage Core Modules</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WorldQuant Config */}
        <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-500" /> WorldQuant Engine
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Auto-submit passed Alphas</span>
              <input type="checkbox" checked={config.worldQuant.autoSubmitPassed} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, autoSubmitPassed: e.target.checked } })} className="accent-blue-600" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Max Drawdown Tolerance (%)</span>
              <input type="number" step="0.01" value={config.worldQuant.riskTolerance} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, riskTolerance: parseFloat(e.target.value) } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Backtest Duration (Years)</span>
              <input type="number" value={config.worldQuant.backtestYears} onChange={e => setConfig({ ...config, worldQuant: { ...config.worldQuant, backtestYears: parseInt(e.target.value) } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>

        {/* Finance Config */}
        <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-amber-500" /> Financial Tracker
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Default Currency</span>
              <input type="text" value={config.finance.defaultCurrency} onChange={e => setConfig({ ...config, finance: { ...config.finance, defaultCurrency: e.target.value } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Tax Rate (%)</span>
              <input type="number" step="0.1" value={config.finance.taxRate} onChange={e => setConfig({ ...config, finance: { ...config.finance, taxRate: parseFloat(e.target.value) } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Savings Target (%)</span>
              <input type="number" value={config.finance.savingsTargetPercent} onChange={e => setConfig({ ...config, finance: { ...config.finance, savingsTargetPercent: parseInt(e.target.value) } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>

        {/* Content Config */}
        <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-blue-500" /> Content & Articles
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Auto-publish to Medium</span>
              <input type="checkbox" checked={config.content.autoPublishToMedium} onChange={e => setConfig({ ...config, content: { ...config.content, autoPublishToMedium: e.target.checked } })} className="accent-blue-600" />
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Require Peer Review</span>
              <input type="checkbox" checked={config.content.requireReview} onChange={e => setConfig({ ...config, content: { ...config.content, requireReview: e.target.checked } })} className="accent-blue-600" />
            </label>
          </div>
        </div>

        {/* Fashion Config */}
        <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-xl border border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Scissors className="w-4 h-4 text-pink-500" /> Fashion Module
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Default Sizing Standard</span>
              <select value={config.fashion.defaultSizing} onChange={e => setConfig({ ...config, fashion: { ...config.fashion, defaultSizing: e.target.value } })} className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500">
                <option value="EU">EU</option>
                <option value="US">US</option>
                <option value="UK">UK</option>
              </select>
            </label>
            <label className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Low Stock Warning Threshold</span>
              <input type="number" value={config.fashion.lowStockThreshold} onChange={e => setConfig({ ...config, fashion: { ...config.fashion, lowStockThreshold: parseInt(e.target.value) } })} className="w-20 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 outline-none focus:border-blue-500" />
            </label>
          </div>
        </div>

      </div>
    </div>
  )
}
