'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, List, BarChart3, Target, Check, Trash2, 
  TrendingUp, TrendingDown, DollarSign, Wallet, Cloud, CloudOff, AlertTriangle
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
  const [activeTab, setActiveTab] = useState<'log' | 'history' | 'breakdown' | 'goals'>('log')
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

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

  // Auto-save to localStorage (Cloud save is manual via Sync button to prevent rate limits)
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem('ceo_finance_entries', JSON.stringify(entries))
    localStorage.setItem('ceo_finance_goals', JSON.stringify(goals))
  }, [entries, goals, isLoaded])

  // Sync to Supabase Cloud
  const handleCloudSync = async () => {
    if (!hasSupabaseKeys) {
      alert("Supabase keys not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. Data is only saving locally.")
      return
    }

    setIsSyncing(true)
    setSyncStatus('idle')
    try {
      // Upsert entries
      const { error: eErr } = await supabase.from('finance_entries').upsert(entries)
      const { error: gErr } = await supabase.from('finance_goals').upsert(goals)
      
      if (eErr || gErr) throw new Error("Sync Failed")
      
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      console.error(error)
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

  if (!isLoaded) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading secure finance module...</div>

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm font-sans w-full max-w-5xl mx-auto">
      {/* Cloud Sync Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="text-blue-500 w-7 h-7" />
            CEO Finance Tracker
          </h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Encrypted Ledger Analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!hasSupabaseKeys && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-md flex items-center gap-1 uppercase tracking-wider">
              <AlertTriangle className="w-3 h-3" /> Local Storage Only
            </div>
          )}
          <button 
            onClick={handleCloudSync} 
            disabled={isSyncing}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              syncStatus === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
              syncStatus === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/30' :
              hasSupabaseKeys ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20' :
              'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700 cursor-not-allowed'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Total Income
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(totalIncome)}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Total Expenses
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
            {formatMoney(totalExpense)}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-sm text-blue-600/80 dark:text-blue-400/80 mb-2">
            <DollarSign className="w-4 h-4" />
            Net Balance
          </div>
          <div className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatMoney(balance)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
        {[
          { id: 'log', label: 'Log Entry', icon: Plus },
          { id: 'history', label: 'History', icon: List },
          { id: 'breakdown', label: 'Breakdown', icon: BarChart3 },
          { id: 'goals', label: 'Goals', icon: Target }
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
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
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${entryType === 'expense' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  >
                    Expense
                  </button>
                  <button 
                    onClick={() => { setEntryType('income'); setCategory(''); }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${entryType === 'income' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                  >
                    Income
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Amount (KSh)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00" 
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
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
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Description (Optional)</label>
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
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-xl transition-colors"
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
                      <List className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No transactions recorded yet.</p>
                  </div>
                ) : (
                  entries.map((e) => (
                    <motion.div 
                      key={e.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 rounded-xl group"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${e.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600'}`}>
                          {e.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{e.desc}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{e.date}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
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
                          className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
              if (expenses.length === 0) return <p className="text-gray-500 text-center py-12">No expense data available for breakdown.</p>
              
              const catTotals: Record<string, number> = {}
              expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount })
              
              const sorted = Object.entries(catTotals).sort((a,b) => b[1] - a[1])
              const max = sorted[0][1]

              return (
                <div className="space-y-6 max-w-3xl">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Expense Categories</h3>
                  {sorted.map(([cat, amt], i) => (
                    <div key={cat} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{cat}</span>
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
                <div className="flex flex-col sm:flex-row gap-4 mb-8 p-5 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Goal Name</label>
                    <input 
                      type="text" 
                      value={goalName}
                      onChange={e => setGoalName(e.target.value)}
                      placeholder="e.g. New Laptop" 
                      className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Target Amount</label>
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
                    <p className="text-gray-500 col-span-full">No goals set yet.</p>
                  ) : (
                    goals.map(g => {
                      const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
                      return (
                        <div key={g.id} className="p-5 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-lg">{g.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                <span className="text-emerald-600 font-semibold">{formatMoney(g.saved)}</span> 
                                {' '}of {formatMoney(g.target)}
                              </p>
                            </div>
                            <button 
                              onClick={() => handleDeleteGoal(g.id)}
                              className="text-gray-400 hover:text-rose-500 transition-colors"
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
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-8">{pct}%</span>
                          </div>

                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Update Saved:</span>
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
