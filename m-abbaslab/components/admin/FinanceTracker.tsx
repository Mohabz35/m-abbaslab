'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, List, BarChart3, Target, Check, Trash2, 
  TrendingUp, TrendingDown, DollarSign, Wallet, Cloud, CloudOff, AlertTriangle, FileDown
} from 'lucide-react'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'

// Types
type EntryType = 'expense' | 'income'

interface FinanceEntry {
  id: number
  type: EntryType
  amount: number
  category: string
  date: string
  desc: string
}

interface SavingsGoal {
  id: number
  name: string
  target: number
  saved: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function FinanceTracker() {
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'breakdown' | 'goals' | 'advisor'>('log')
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [dailyTarget, setDailyTarget] = useState(25)

  // Log Form State
  const [entryType, setEntryType] = useState<EntryType>('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [desc, setDesc] = useState('')
  const [error, setError] = useState('')

  // Goal Form State
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Advisor & CSV/PDF Upload State
  const [statementFile, setStatementFile] = useState<File | null>(null)
  const [advisorAdvice, setAdvisorAdvice] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [pdfTextContext, setPdfTextContext] = useState<string>('')

  // Load Data
  useEffect(() => {
    const loadData = async () => {
      try {
        let loadedEntries = null
        let loadedGoals = null

        // Try Supabase first if keys exist
        if (hasSupabaseKeys) {
          const { data: dbEntries, error: eErr } = await supabase.from('finance_entries').select('*')
          const { data: dbGoals, error: gErr } = await supabase.from('finance_goals').select('*')
          
          if (!eErr && dbEntries && dbEntries.length > 0) loadedEntries = dbEntries
          if (!gErr && dbGoals && dbGoals.length > 0) loadedGoals = dbGoals
        }

        // Fallback to localStorage
        if (!loadedEntries) {
          const savedEntries = localStorage.getItem('ceo_finance_entries')
          if (savedEntries) loadedEntries = JSON.parse(savedEntries)
        }
        if (!loadedGoals) {
          const savedGoals = localStorage.getItem('ceo_finance_goals')
          if (savedGoals) loadedGoals = JSON.parse(savedGoals)
        }

        if (loadedEntries) setEntries(loadedEntries)
        if (loadedGoals) setGoals(loadedGoals)
      } catch (e) {
        console.error('Failed to load finance data', e)
      } finally {
        setIsLoaded(true)
      }
    }
    loadData()
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('ceo_finance_entries', JSON.stringify(entries))
    localStorage.setItem('ceo_finance_goals', JSON.stringify(goals))
  }, [entries, goals, isLoaded])

  // Auto-sync to Supabase Cloud whenever data changes (debounced by 1.5s)
  useEffect(() => {
    if (!isLoaded || !hasSupabaseKeys) return

    // Don't auto-sync if we have nothing to sync yet (optional safeguard)
    if (entries.length === 0 && goals.length === 0) return

    const autoSync = async () => {
      setIsSyncing(true)
      setSyncStatus('idle')
      try {
        const { error: eErr } = await supabase.from('finance_entries').upsert(entries)
        const { error: gErr } = await supabase.from('finance_goals').upsert(goals)
        
        if (eErr || gErr) {
          console.error("Supabase Auto-Sync Failed:", { entriesError: eErr, goalsError: gErr })
          setSyncStatus('error')
        } else {
          setSyncStatus('success')
          setTimeout(() => setSyncStatus('idle'), 3000)
        }
      } catch (err) {
        console.error("Auto-sync exception:", err)
        setSyncStatus('error')
      } finally {
        setIsSyncing(false)
      }
    }

    const timer = setTimeout(() => {
      autoSync()
    }, 1500)

    return () => clearTimeout(timer)
  }, [entries, goals, isLoaded])

  // PDF Export
  const [isExporting, setIsExporting] = useState(false)
  const exportFinancePDF = async () => {
    setIsExporting(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default
      const element = document.getElementById('finance-export-container')
      if (!element) return
      await html2pdf().set({
        margin: 10,
        filename: `FinanceTracker_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(element).save()
    } catch (err) {
      console.error('PDF export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Sync to Supabase Cloud (Manual trigger / retry)
  const handleCloudSync = async () => {
    if (!hasSupabaseKeys) {
      alert("Supabase keys not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. Data is only saving locally.")
      return
    }

    setIsSyncing(true)
    setSyncStatus('idle')
    try {
      const { error: eErr } = await supabase.from('finance_entries').upsert(entries)
      const { error: gErr } = await supabase.from('finance_goals').upsert(goals)
      
      if (eErr || gErr) {
        console.error("Supabase Sync Failed:", { entriesError: eErr, goalsError: gErr })
        throw new Error(`Sync Failed: ${eErr?.message || gErr?.message || "Unknown DB Error"}`)
      }
      
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error: any) {
      console.error("Cloud Sync Error details:", error)
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  // Calculations
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0, exp = 0
    entries.forEach(e => {
      if (e.type === 'income') inc += e.amount
      else exp += e.amount
    })
    return { totalIncome: inc, totalExpense: exp, balance: inc - exp }
  }, [entries])

  const formatMoney = (val: number) => {
    return 'KSh ' + Math.round(val).toLocaleString()
  }

  // Daily income tracking
  const todayStr = new Date().toISOString().split('T')[0]
  const todayIncome = entries
    .filter(e => e.type === 'income' && e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0)
  const dailyProgress = Math.min(100, Math.round((todayIncome / dailyTarget) * 100))
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()
  const monthTarget = dailyTarget * daysInMonth
  const monthIncome = entries
    .filter(e => e.type === 'income' && e.date.startsWith(todayStr.substring(0, 7)))
    .reduce((sum, e) => sum + e.amount, 0)
  const monthProgress = Math.min(100, Math.round((monthIncome / monthTarget) * 100))

  // Handlers
  const handleAddEntry = () => {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0 || !category || !date) {
      setError('Please fill in amount, category, and date.')
      return
    }
    setError('')
    
    const newEntry: FinanceEntry = {
      id: Date.now(),
      type: entryType,
      amount: amt,
      category,
      date,
      desc: desc.trim() || category
    }

    setEntries(prev => [newEntry, ...prev])
    setAmount('')
    setCategory('')
    setDesc('')
  }

  const handleDeleteEntry = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const handleAddGoal = () => {
    const target = parseFloat(goalTarget)
    if (!goalName.trim() || !target || target <= 0) return
    
    setGoals(prev => [...prev, {
      id: Date.now(),
      name: goalName.trim(),
      target,
      saved: 0
    }])
    setGoalName('')
    setGoalTarget('')
  }

  const handleDeleteGoal = (id: number) => {
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const handleUpdateGoalSaved = (id: number, val: string) => {
    const numVal = parseFloat(val)
    if (isNaN(numVal)) return
    
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, saved: Math.max(0, numVal) } : g
    ))
  }

  const handleUploadStatement = async () => {
    if (!statementFile) return
    setUploadStatus(`Processing ${statementFile.name}...`)
    
    try {
      if (statementFile.name.endsWith('.csv')) {
        const text = await statementFile.text()
        const lines = text.split('\n')
        const newEntries: FinanceEntry[] = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          const cols = lines[i].split(',')
          if (cols.length >= 3) {
            const date = cols[0].trim()
            const desc = cols[1].trim()
            let amount = parseFloat(cols[2])
            const type = (cols[3] || '').toLowerCase().includes('income') || amount > 0 ? 'income' : 'expense'
            amount = Math.abs(amount)
            
            if (!isNaN(amount)) {
              newEntries.push({
                id: Date.now() + i,
                type,
                amount,
                category: 'Imported',
                date: date || new Date().toISOString().split('T')[0],
                desc
              })
            }
          }
        }
        
        if (newEntries.length > 0) {
          setEntries(prev => [...newEntries, ...prev])
          setUploadStatus(`Successfully imported ${newEntries.length} transactions.`)
        } else {
          setUploadStatus('No valid transactions found in CSV.')
        }
      } else if (statementFile.name.endsWith('.pdf')) {
        const formData = new FormData()
        formData.append('file', statementFile)
        const res = await fetch('/api/admin/finance-advisor/pdf', {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        if (data.success) {
          setPdfTextContext(data.text)
          setUploadStatus('PDF parsed successfully! Ready for AI Analysis.')
        } else {
          setUploadStatus(data.error || 'Failed to parse PDF.')
        }
      } else {
        setUploadStatus('Unsupported file format.')
      }
    } catch (err) {
      setUploadStatus('Failed to process file format.')
    }
    setStatementFile(null)
    setTimeout(() => setUploadStatus(''), 4000)
  }

  const handleAIAdvisor = async () => {
    setIsAnalyzing(true)
    setAdvisorAdvice(null)
    try {
      const res = await fetch('/api/admin/finance-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: entries, pdfText: pdfTextContext })
      })
      const data = await res.json()
      if (data.success) {
        setAdvisorAdvice(data.advice)
      } else {
        setAdvisorAdvice("Error: Unable to generate advice.")
      }
    } catch (e) {
      setAdvisorAdvice("Error communicating with AI Advisor.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!isLoaded) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse">Loading secure finance module...</div>

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm font-sans w-full max-w-5xl mx-auto">
      {/* Cloud Sync Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-blue-500 w-7 h-7" />
            CEO Finance Tracker
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest font-bold">Encrypted Ledger Analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!hasSupabaseKeys && (
            <div className="px-3 py-1 bg-amber-500/10 border border-gray-200 dark:border-gray-700 border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" /> Local Storage Only
            </div>
          )}
          <button
            onClick={exportFinancePDF}
            disabled={isExporting || entries.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-600/10 text-purple-500 border border-gray-200 dark:border-gray-700 border-purple-500/20 hover:bg-purple-600/20 transition-all disabled:opacity-50"
          >
            <FileDown className="w-3 h-3" />
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
          <button 
            onClick={handleCloudSync} 
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              syncStatus === 'success' ? 'bg-green-500/10 text-green-500 border border-gray-200 dark:border-gray-700 border-green-500/30' :
              syncStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-gray-200 dark:border-gray-700 border-red-500/30' :
              hasSupabaseKeys ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
              'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
            }`}
            title={hasSupabaseKeys ? "Sync data to Supabase Cloud" : "Requires Supabase Keys in .env"}
          >
            {isSyncing ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : 
             syncStatus === 'success' ? <Check className="w-4 h-4" /> :
             hasSupabaseKeys ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            {isSyncing ? 'Syncing...' : syncStatus === 'success' ? 'Synced to Cloud' : 'Cloud Sync'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div id="finance-export-container" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Total Income
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalIncome)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Total Expenses
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalExpense)}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-sm text-blue-600/80 dark:text-blue-400/80 mb-2">
            <DollarSign className="w-4 h-4" />
            Net Balance
          </div>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatMoney(balance)}
          </div>
        </div>
      </div>

      {/* Daily Income Target Tracker */}
      <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 dark:from-emerald-900/30 dark:to-green-900/30 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 border-emerald-500/20 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4" /> Daily Income Target
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400">Target:</label>
            <input
              type="number"
              value={dailyTarget}
              onChange={e => setDailyTarget(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 bg-white dark:bg-gray-800/5 border border-gray-200 dark:border-gray-700 border-white/10 rounded-lg px-2 py-1 text-xs text-white text-right outline-none focus:border-emerald-500/50"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">/day</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today */}
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Today ({dayOfMonth}/{daysInMonth})</span>
              <span className={`text-sm font-bold ${dailyProgress >= 100 ? 'text-emerald-400' : dailyProgress >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {dailyProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-gray-800/5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailyProgress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                  dailyProgress >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${dailyProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-bold">{formatMoney(todayIncome)}</span>
              <span className="text-gray-500 dark:text-gray-400">of {formatMoney(dailyTarget)}</span>
            </div>
          </div>

          {/* Monthly */}
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Month Total</span>
              <span className={`text-sm font-bold ${monthProgress >= 100 ? 'text-emerald-400' : monthProgress >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {monthProgress}%
              </span>
            </div>
            <div className="w-full h-3 bg-white dark:bg-gray-800/5 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  monthProgress >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                  monthProgress >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${monthProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400 font-bold">{formatMoney(monthIncome)}</span>
              <span className="text-gray-500 dark:text-gray-400">of {formatMoney(monthTarget)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        {[
          { id: 'log', label: 'Log Entry', icon: Plus },
          { id: 'history', label: 'History', icon: List },
          { id: 'breakdown', label: 'Breakdown', icon: BarChart3 },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'advisor', label: 'AI Advisor & Import', icon: Cloud }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 dark:text-gray-50 shadow-md' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* LOG TAB */}
            {activeTab === 'log' && (
              <div className="max-w-3xl space-y-6">
                <div className="flex gap-3 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl inline-flex">
                  <button 
                    onClick={() => { setEntryType('expense'); setCategory(''); }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${entryType === 'expense' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:text-gray-400'}`}
                  >
                    Expense
                  </button>
                  <button 
                    onClick={() => { setEntryType('income'); setCategory(''); }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${entryType === 'income' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:text-gray-400'}`}
                  >
                    Income
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Amount (KSh)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select category...</option>
                      {entryType === 'expense' ? (
                        <>
                          <option>Food & drinks</option>
                          <option>Transport</option>
                          <option>Clothing & fashion</option>
                          <option>Business</option>
                          <option>Education</option>
                          <option>Entertainment</option>
                          <option>Health</option>
                          <option>Savings</option>
                          <option>Other</option>
                        </>
                      ) : (
                        <>
                          <option>Salary / freelance</option>
                          <option>Business income</option>
                          <option>Investments</option>
                          <option>Other</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Description (Optional)</label>
                    <input 
                      type="text" 
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                      placeholder="What was this for?" 
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                {error && <p className="text-rose-500 text-sm">{error}</p>}

                <button 
                  onClick={handleAddEntry}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:bg-gray-800 text-white dark:text-gray-900 dark:text-gray-50 font-medium rounded-xl transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Save Entry
                </button>
              </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <List className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No transactions recorded yet.</p>
                  </div>
                ) : (
                  entries.map((e) => (
                    <motion.div 
                      key={e.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-800 rounded-xl group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${e.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                          {e.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{e.desc}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{e.date}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">
                              {e.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-bold ${e.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                          {e.type === 'income' ? '+' : '-'}{formatMoney(e.amount)}
                        </span>
                        <button 
                          onClick={() => handleDeleteEntry(e.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* BREAKDOWN TAB */}
            {activeTab === 'breakdown' && (() => {
              const expenses = entries.filter(e => e.type === 'expense')
              if (expenses.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-center py-12">No expense data available for breakdown.</p>
              
              const catTotals: Record<string, number> = {}
              expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount })
              
              const sorted = Object.entries(catTotals).sort((a,b) => b[1] - a[1])
              const max = sorted[0][1]

              return (
                <div className="space-y-6 max-w-3xl">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Expense Categories</h3>
                  {sorted.map(([cat, amt], i) => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">{cat}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{formatMoney(amt)}</span>
                      </div>
                      <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(amt/max) * 100}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* GOALS TAB */}
            {activeTab === 'goals' && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-800 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Goal Name</label>
                    <input 
                      type="text" 
                      value={goalName}
                      onChange={e => setGoalName(e.target.value)}
                      placeholder="e.g. New Laptop" 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Target Amount</label>
                    <input 
                      type="number" 
                      value={goalTarget}
                      onChange={e => setGoalTarget(e.target.value)}
                      placeholder="KSh" 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <button 
                    onClick={handleAddGoal}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Add Goal
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 col-span-full">No goals set yet.</p>
                  ) : (
                    goals.map(g => {
                      const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
                      return (
                        <div key={g.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">{g.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="text-emerald-600 font-semibold">{formatMoney(g.saved)}</span> 
                                {' '}of {formatMoney(g.target)}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleDeleteGoal(g.id)}
                              className="text-gray-500 dark:text-gray-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-emerald-500 rounded-full"
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300 w-8">{pct}%</span>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">Update Saved:</span>
                            <input 
                              type="number" 
                              placeholder="KSh"
                              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-[90px] pr-4 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-blue-500"
                              onBlur={(e) => {
                                if (e.target.value) {
                                  handleUpdateGoalSaved(g.id, e.target.value)
                                  e.target.value = ''
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.currentTarget.blur()
                              }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {/* AI ADVISOR & IMPORT TAB */}
            {activeTab === 'advisor' && (
              <div className="space-y-8">
                {/* CSV/PDF Import */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-blue-500" />
                    Bulk Bank Statement Import
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Upload a .CSV or .PDF statement file. PDF will be parsed and sent directly to AI.</p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <input 
                      type="file" 
                      accept=".csv,.pdf"
                      onChange={e => setStatementFile(e.target.files?.[0] || null)}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />
                    <button
                      onClick={handleUploadStatement}
                      disabled={!statementFile}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:bg-gray-800 text-white dark:text-gray-900 dark:text-gray-50 font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      Process Statement
                    </button>
                  </div>
                  {uploadStatus && <p className="mt-3 text-sm text-blue-500 font-medium">{uploadStatus}</p>}
                </div>

                {/* AI Advisory */}
                <div className="p-6 border border-gray-200 dark:border-gray-700 border-emerald-500/30 bg-emerald-500/5 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        AI Financial Analyst
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Scan your entire ledger and receive automated wealth-building advice.</p>
                    </div>
                    <button
                      onClick={handleAIAdvisor}
                      disabled={isAnalyzing || (entries.length === 0 && !pdfTextContext)}
                      className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Analyzing Ledger...' : 'Run Analysis'}
                    </button>
                  </div>

                  {advisorAdvice && (
                    <div className="mt-6 p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        {advisorAdvice.split('\\n').map((line, i) => (
                          <p key={i} className="mb-2">{line.replace(/\\*\\*/g, '')}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
