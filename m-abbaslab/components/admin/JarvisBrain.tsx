'use client'

import React, { useState } from 'react'
import { Brain, Plus, Trash2, Edit, Save, CheckCircle, HelpCircle, Clock } from 'lucide-react'

interface Rule {
  keyword: string
  response: string
}

interface JarvisBrainProps {
  rules: Rule[]
  onChange: (rules: Rule[]) => void
  schedule?: {
    type: 'always' | 'working' | 'non-working' | 'disabled'
    workingHoursStart: string
    workingHoursEnd: string
    timezone: string
  }
  onScheduleChange?: (schedule: any) => void
}

export default function JarvisBrain({
  rules = [],
  onChange,
  schedule = {
    type: 'always',
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    timezone: 'Africa/Nairobi'
  },
  onScheduleChange
}: JarvisBrainProps) {
  const [newKeyword, setNewKeyword] = useState('')
  const [newResponse, setNewResponse] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editKeyword, setEditKeyword] = useState('')
  const [editResponse, setEditResponse] = useState('')

  const handleAddRule = () => {
    if (!newKeyword.trim() || !newResponse.trim()) return
    const kw = newKeyword.trim().toLowerCase()
    
    // Check if keyword already exists
    if (rules.some(r => r.keyword === kw)) {
      alert('This keyword is already trained. Edit the existing rule instead.')
      return
    }

    const updated = [...rules, { keyword: kw, response: newResponse.trim() }]
    onChange(updated)
    setNewKeyword('')
    setNewResponse('')
  }

  const handleDeleteRule = (index: number) => {
    if (confirm('Delete this Jarvis response rule?')) {
      const updated = rules.filter((_, i) => i !== index)
      onChange(updated)
    }
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditKeyword(rules[index].keyword)
    setEditResponse(rules[index].response)
  }

  const handleSaveEdit = (index: number) => {
    if (!editKeyword.trim() || !editResponse.trim()) return
    const kw = editKeyword.trim().toLowerCase()

    const updated = rules.map((r, i) => 
      i === index ? { keyword: kw, response: editResponse.trim() } : r
    )
    onChange(updated)
    setEditingIndex(null)
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="text-blue-500 w-6 h-6 animate-pulse" />
            M-JARVIS Brain Training Panel
          </h2>
          <p className="text-sm text-gray-500 mt-1">Train your AI Chatbot and WhatsApp bot on custom keywords and rules.</p>
        </div>
        <div className="mt-4 md:mt-0 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          🧠 Active Rules: {rules.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Trained Knowledge Base</h3>
          
          {rules.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-center text-gray-500">
              No knowledge rules trained yet. Add rules on the right to start training!
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {rules.map((rule, idx) => (
                <div key={idx} className="p-4 bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-white/5 rounded-xl flex flex-col justify-between gap-3">
                  {editingIndex === idx ? (
                    <div className="space-y-3 w-full">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Keyword Trigger</label>
                        <input
                          value={editKeyword}
                          onChange={(e) => setEditKeyword(e.target.value)}
                          className="w-full mt-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold">Jarvis Custom Response</label>
                        <textarea
                          value={editResponse}
                          onChange={(e) => setEditResponse(e.target.value)}
                          rows={3}
                          className="w-full mt-1 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingIndex(null)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-xs rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg font-bold"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 text-xs font-mono font-bold rounded-lg border border-blue-500/20">
                          keyword: "{rule.keyword}"
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleStartEdit(idx)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-blue-500 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRule(idx)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-gray-150 dark:border-white/5">
                        {rule.response}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Rule Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Add New Training Rule</h3>
          
          <div className="bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-white/5 rounded-2xl p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trigger Keyword</label>
              <input
                type="text"
                placeholder="e.g. royal icon events"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">When a user mentions this exact phrase or word, Jarvis responds instantly with the trained text.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jarvis Reply</label>
              <textarea
                placeholder="Write exactly what Jarvis should reply when this keyword is triggered..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                rows={4}
                className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>

            <button
              onClick={handleAddRule}
              disabled={!newKeyword.trim() || !newResponse.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Train New Rule
            </button>
          </div>

          {/* Chatbot Scheduling Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              WhatsApp Engine Scheduling
            </h3>
            
            <div className="bg-gray-50 dark:bg-black/40 border border-gray-150 dark:border-white/5 rounded-2xl p-5 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Active Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'always', label: '24/7 Always', desc: 'Active always' },
                    { id: 'working', label: 'Working Hours', desc: 'Active 08:00 - 17:00' },
                    { id: 'non-working', label: 'Non-Working', desc: 'Active outside work' },
                    { id: 'disabled', label: 'Disabled', desc: 'Engine offline' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => onScheduleChange && onScheduleChange({ ...schedule, type: mode.id })}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        schedule.type === mode.id
                          ? 'bg-blue-500/15 border-blue-500/50 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10'
                      }`}
                    >
                      <div className="font-bold">{mode.label}</div>
                      <div className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {schedule.type !== 'always' && schedule.type !== 'disabled' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-gray-150 dark:border-white/5 animate-fadeIn">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Start Time</label>
                    <input
                      type="time"
                      value={schedule.workingHoursStart || '08:00'}
                      onChange={(e) => onScheduleChange && onScheduleChange({ ...schedule, workingHoursStart: e.target.value })}
                      className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500/50 text-gray-800 dark:text-gray-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">End Time</label>
                    <input
                      type="time"
                      value={schedule.workingHoursEnd || '17:00'}
                      onChange={(e) => onScheduleChange && onScheduleChange({ ...schedule, workingHoursEnd: e.target.value })}
                      className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-500/50 text-gray-800 dark:text-gray-200 font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Timezone</label>
                <select
                  value={schedule.timezone || 'Africa/Nairobi'}
                  onChange={(e) => onScheduleChange && onScheduleChange({ ...schedule, timezone: e.target.value })}
                  className="w-full bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500/50 text-gray-700 dark:text-gray-300"
                >
                  <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (EST/EDT)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+4)</option>
                </select>
                <div className="mt-1 flex items-center gap-1 text-[9px] text-gray-400 dark:text-gray-500">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Active timezone synced with WhatsApp Daemon.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              How it works
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Trained keyword rules provide **instant, 100% free response matches** on both your website AI widget and your WhatsApp engine, saving paid API tokens and ensuring consistent custom answers!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
