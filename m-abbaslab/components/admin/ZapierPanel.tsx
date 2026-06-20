'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, Send, RefreshCw, CheckCircle, AlertTriangle, Link as LinkIcon,
  Copy, ExternalLink, Plus, Trash2, Play, Clock, ChevronRight,
  Globe, Mail, MessageSquare, BarChart2, FileText, Sparkles,
  Check, X, Activity, Webhook, ArrowRight, Info
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ZapTemplate {
  id: string
  name: string
  description: string
  eventName: string
  category: string
  icon: any
  color: string
  payload: Record<string, any>
  zapierAction: string
}

interface TriggerLog {
  id: string
  eventName: string
  status: 'success' | 'error' | 'pending'
  timestamp: string
  payload: string
  response?: string
}

// ─── Pre-built Automation Templates ─────────────────────────────────────────

const ZAP_TEMPLATES: ZapTemplate[] = [
  {
    id: 'new_lead',
    name: 'New Lead to CRM',
    description: 'When someone signs up or contacts you, automatically add them to your CRM (Notion, Airtable, Google Sheets).',
    eventName: 'new_lead',
    category: 'CRM',
    icon: Mail,
    color: '#0A66C2',
    zapierAction: 'Create row in Google Sheets / Add record to Airtable',
    payload: { email: 'investor@example.com', name: 'Jane Doe', source: 'QIS_Portal', timestamp: new Date().toISOString() }
  },
  {
    id: 'article_published',
    name: 'Article Published → Social',
    description: 'When you publish a new article, automatically cross-post a summary to X (Twitter), LinkedIn, and Discord.',
    eventName: 'article_published',
    category: 'Content',
    icon: FileText,
    color: '#E4405F',
    zapierAction: 'Post to Twitter + LinkedIn + Discord channel',
    payload: { title: 'My New Research Article', slug: 'my-new-research-article', excerpt: 'Key findings from...', url: 'https://m-abbaslab.vercel.app/articles/my-new-research-article' }
  },
  {
    id: 'finance_alert',
    name: 'Finance Threshold Alert',
    description: 'When a tracked expense exceeds a budget limit, send a Slack message and create a Notion entry.',
    eventName: 'finance_alert',
    category: 'Finance',
    icon: BarChart2,
    color: '#4ade80',
    zapierAction: 'Send Slack message + Create Notion page',
    payload: { alert_type: 'budget_exceeded', category: 'Marketing', amount: 1500, budget: 1000, currency: 'USD' }
  },
  {
    id: 'alpha_result',
    name: 'Alpha Test Result',
    description: 'When a WorldQuant alpha passes or fails, log it to a Google Sheet and send a WhatsApp notification.',
    eventName: 'alpha_result',
    category: 'Alpha Lab',
    icon: Activity,
    color: '#a855f7',
    zapierAction: 'Log to Google Sheets + Send WhatsApp via Twilio',
    payload: { alpha_id: 'alpha_001', status: 'passed', sharpe: 1.42, fitness: 0.87, timestamp: new Date().toISOString() }
  },
  {
    id: 'discipline_report',
    name: 'Weekly Discipline Report',
    description: 'Every Sunday, automatically email your weekly discipline score summary to yourself.',
    eventName: 'discipline_report',
    category: 'Discipline OS',
    icon: Sparkles,
    color: '#f59e0b',
    zapierAction: 'Send email via Gmail with weekly summary',
    payload: { week: 'Week 22, 2026', overall_score: 82, habits_completed: 5, habits_total: 7, streak: 14 }
  },
  {
    id: 'custom',
    name: 'Custom Event',
    description: 'Send a fully custom event with your own payload to any Zapier webhook you have configured.',
    eventName: 'custom_event',
    category: 'Custom',
    icon: Zap,
    color: '#f97316',
    zapierAction: 'Your configured Zapier action',
    payload: { message: 'Hello from M-AbbasLab!', data: {} }
  },
]

const WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/incoming`
  : typeof window !== 'undefined'
  ? `${window.location.origin}/api/webhooks/incoming`
  : 'https://your-site.vercel.app/api/webhooks/incoming'

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusDot({ status }: { status: 'success' | 'error' | 'pending' }) {
  const map = {
    success: 'bg-emerald-400',
    error: 'bg-rose-400',
    pending: 'bg-amber-400 animate-pulse',
  }
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status]}`} />
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors" title="Copy">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ZapierPanel() {
  const [activeTab, setActiveTab] = useState<'automations' | 'trigger' | 'webhook' | 'logs' | 'guide'>('automations')
  const [selectedTemplate, setSelectedTemplate] = useState<ZapTemplate | null>(null)
  const [payloadText, setPayloadText] = useState('')
  const [eventName, setEventName] = useState('new_lead')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [logs, setLogs] = useState<TriggerLog[]>([])
  const [isConfigured] = useState(!!process.env.NEXT_PUBLIC_ZAPIER_WEBHOOK_URL)

  // Load mock logs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('zapier_logs')
      if (saved) setLogs(JSON.parse(saved))
    } catch {}
  }, [])

  const saveLogs = (newLogs: TriggerLog[]) => {
    setLogs(newLogs)
    try { localStorage.setItem('zapier_logs', JSON.stringify(newLogs.slice(0, 20))) } catch {}
  }

  const selectTemplate = (template: ZapTemplate) => {
    setSelectedTemplate(template)
    setEventName(template.eventName)
    setPayloadText(JSON.stringify(template.payload, null, 2))
    setActiveTab('trigger')
  }

  const handleTrigger = async () => {
    setStatus('loading')
    setErrorMsg('')
    const logEntry: TriggerLog = {
      id: Date.now().toString(),
      eventName,
      status: 'pending',
      timestamp: new Date().toISOString(),
      payload: payloadText,
    }

    try {
      let payload: any
      try { payload = JSON.parse(payloadText) } catch { throw new Error('Invalid JSON payload') }

      const res = await fetch('/api/admin/zapier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventName, payload }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setStatus('success')
        logEntry.status = 'success'
        logEntry.response = 'Webhook delivered successfully'
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        throw new Error(data.error || 'Webhook failed')
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message)
      logEntry.status = 'error'
      logEntry.response = err.message
    } finally {
      saveLogs([logEntry, ...logs])
    }
  }

  const clearLogs = () => saveLogs([])

  const TABS = [
    { id: 'automations', label: 'Templates', icon: Sparkles },
    { id: 'trigger', label: 'Fire Webhook', icon: Send },
    { id: 'webhook', label: 'Incoming URL', icon: Webhook },
    { id: 'logs', label: `Logs (${logs.length})`, icon: Activity },
    { id: 'guide', label: 'Setup Guide', icon: Info },
  ] as const

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            Zapier & Automation Hub
          </h2>
          <p className="text-sm text-slate-400 mt-1">Fire webhooks, manage pre-built zaps, catch incoming triggers, and monitor all automation activity.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold ${isConfigured ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
          <LinkIcon className="w-4 h-4" />
          {isConfigured ? 'Webhook Connected ✓' : 'Webhook Not Configured'}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 border-slate-700 bg-slate-800/40 px-2 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${activeTab === id ? 'border-orange-500 text-orange-400 bg-orange-500/5' : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

              {/* ── AUTOMATION TEMPLATES ── */}
              {activeTab === 'automations' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Click a template to instantly pre-fill the webhook trigger with the right event name and payload. Then fire it to your Zapier account with one click.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {ZAP_TEMPLATES.map(template => {
                      const Icon = template.icon
                      return (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => selectTemplate(template)}
                          className="text-left bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 hover:border-slate-500 rounded-xl p-5 space-y-3 transition-all group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="p-2.5 rounded-xl" style={{ background: template.color + '20' }}>
                              <Icon className="w-5 h-5" style={{ color: template.color }} />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 uppercase tracking-widest">{template.category}</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm leading-snug">{template.name}</h3>
                            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{template.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <ArrowRight className="w-3.5 h-3.5" style={{ color: template.color }} />
                            <span className="text-slate-400">{template.zapierAction}</span>
                          </div>
                          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3.5 h-3.5" /> Click to use this template
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── FIRE WEBHOOK ── */}
              {activeTab === 'trigger' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    {selectedTemplate && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-gray-200 dark:border-gray-700 border-orange-500/30 rounded-xl">
                        <selectedTemplate.icon className="w-4 h-4 shrink-0" style={{ color: selectedTemplate.color }} />
                        <div>
                          <p className="text-xs font-bold text-orange-400">Using Template: {selectedTemplate.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{selectedTemplate.zapierAction}</p>
                        </div>
                        <button onClick={() => setSelectedTemplate(null)} className="ml-auto p-1 rounded text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Event Name</label>
                      <select value={eventName} onChange={e => setEventName(e.target.value)}
                        className="w-full bg-slate-800 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500">
                        {ZAP_TEMPLATES.map(t => (
                          <option key={t.id} value={t.eventName}>{t.eventName} — {t.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">JSON Payload</label>
                        <button onClick={() => {
                          try { setPayloadText(JSON.stringify(JSON.parse(payloadText), null, 2)) } catch {}
                        }} className="text-xs text-slate-400 hover:text-slate-300 transition-colors">Format JSON</button>
                      </div>
                      <textarea value={payloadText} onChange={e => setPayloadText(e.target.value)}
                        rows={10}
                        className="w-full font-mono text-xs bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl px-4 py-3 text-emerald-300 focus:outline-none focus:border-orange-500 resize-none" />
                    </div>

                    {status === 'error' && (
                      <div className="p-3 bg-rose-500/10 border border-gray-200 dark:border-gray-700 border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
                      </div>
                    )}

                    {status === 'success' && (
                      <div className="p-3 bg-emerald-500/10 border border-gray-200 dark:border-gray-700 border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 shrink-0" /> Webhook fired successfully! Check your Zapier task history.
                      </div>
                    )}

                    <button onClick={handleTrigger} disabled={status === 'loading'}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20">
                      {status === 'loading' ? <><RefreshCw className="w-4 h-4 animate-spin" /> Firing Zap...</>
                        : status === 'success' ? <><CheckCircle className="w-4 h-4" /> Zap Fired! 🚀</>
                        : <><Send className="w-4 h-4" /> Fire Webhook to Zapier</>}
                    </button>
                  </div>

                  {/* JSON Preview */}
                  <div className="bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Payload Preview</h3>
                    <pre className="text-xs text-emerald-300 whitespace-pre-wrap overflow-auto max-h-96 font-mono leading-relaxed">
                      {(() => { try { return JSON.stringify(JSON.parse(payloadText), null, 2) } catch { return payloadText } })()}
                    </pre>
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <p className="text-xs text-slate-400">This payload will be sent to your Zapier webhook URL as a POST request with <code className="text-orange-400">Content-Type: application/json</code>.</p>
                      <p className="text-xs text-slate-400">Zapier will receive <code className="text-orange-400">event_name</code> + <code className="text-orange-400">payload</code> as a single JSON body.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── INCOMING WEBHOOK ── */}
              {activeTab === 'webhook' && (
                <div className="space-y-5">
                  <div className="bg-blue-500/10 border border-gray-200 dark:border-gray-700 border-b border-gray-200 dark:border-gray-700lue-500/30 rounded-xl p-4 flex gap-3">
                    <Globe className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-400">Your Incoming Webhook URL</p>
                      <p className="text-sm text-slate-400 mt-1">Use this URL as the destination in any external service (Zapier, Make.com, IFTTT, or your own scripts) to receive data INTO your dashboard. Your app listens to this endpoint and can trigger actions like logging an event, sending a WhatsApp message, or updating Supabase.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Webhook Endpoint</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl px-4 py-3">
                      <code className="flex-1 text-sm text-orange-300 font-mono break-all">{WEBHOOK_URL}</code>
                      <CopyButton text={WEBHOOK_URL} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'From Zapier → Your App', steps: ['In Zapier, add an "Action" step', 'Choose "Webhooks by Zapier"', 'Select "POST" as the event', 'Paste your webhook URL above', 'Map fields from your trigger to the body', 'Test the step — data appears in your logs!'] },
                      { title: 'From Make.com / IFTTT', steps: ['Create a new Scenario in Make.com', 'Add an HTTP module → Make a request', 'Set Method: POST, URL: your webhook URL', 'Set Body Type: JSON', 'Map your data fields', 'Run the scenario and watch your logs'] },
                    ].map(section => (
                      <div key={section.title} className="bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-5 space-y-3">
                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                          <ChevronRight className="w-4 h-4 text-orange-400" /> {section.title}
                        </h3>
                        <ol className="space-y-2">
                          {section.steps.map((step, i) => (
                            <li key={i} className="flex gap-3 text-xs text-slate-400">
                              <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </div>

                  <div className="bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-5">
                    <h3 className="font-bold text-white text-sm mb-3">Expected Request Format</h3>
                    <pre className="text-xs text-emerald-300 font-mono bg-slate-900 p-4 rounded-xl overflow-auto">{`POST ${WEBHOOK_URL}
Content-Type: application/json

{
  "event": "your_event_name",
  "source": "zapier",
  "data": {
    // any data you want to pass
  }
}`}</pre>
                  </div>
                </div>
              )}

              {/* ── LOGS ── */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Trigger History</h3>
                    {logs.length > 0 && (
                      <button onClick={clearLogs} className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                      </button>
                    )}
                  </div>

                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">No webhook triggers yet. Fire your first zap to see results here.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map(log => (
                        <div key={log.id} className="bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusDot status={log.status} />
                              <span className="text-sm font-bold text-white font-mono">{log.eventName}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : log.status === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {log.status}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400"><Clock className="w-3 h-3 inline mr-1" />{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          {log.response && (
                            <p className={`text-xs ${log.status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>{log.response}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── SETUP GUIDE ── */}
              {activeTab === 'guide' && (
                <div className="space-y-6">
                  <div className="bg-orange-500/10 border border-gray-200 dark:border-gray-700 border-orange-500/30 rounded-xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-orange-400">Does Zapier actually work?</p>
                      <p className="text-sm text-slate-300 mt-1">
                        <strong className="text-white">Yes — if you have set the environment variable.</strong> Your codebase already has a <code className="text-orange-400">/api/admin/zapier</code> route that reads <code className="text-orange-400">NEXT_PUBLIC_ZAPIER_WEBHOOK_URL</code> and sends a POST request to it. As long as that variable points to a valid Zapier "Catch Hook" URL, every trigger you fire from this panel will land in your Zapier task history.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Step-by-Step Setup</h3>
                      {[
                        { step: '1', title: 'Open Zapier', desc: 'Go to zapier.com and click "Create Zap".' },
                        { step: '2', title: 'Set Trigger: Webhooks', desc: 'Choose "Webhooks by Zapier" → "Catch Hook" as your trigger.' },
                        { step: '3', title: 'Copy the Webhook URL', desc: 'Zapier gives you a unique URL like https://hooks.zapier.com/hooks/catch/...' },
                        { step: '4', title: 'Add to Vercel Env Vars', desc: 'Go to Vercel → Project Settings → Environment Variables. Add NEXT_PUBLIC_ZAPIER_WEBHOOK_URL = your URL.' },
                        { step: '5', title: 'Redeploy', desc: 'Trigger a Vercel redeployment so the new env variable is picked up.' },
                        { step: '6', title: 'Test It!', desc: 'Come back here → "Fire Webhook" tab → select a template → hit "Fire Webhook". Then in Zapier click "Test Trigger" to see your data arrive!' },
                      ].map(item => (
                        <div key={item.step} className="flex gap-4">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0">{item.step}</div>
                          <div>
                            <p className="font-bold text-white text-sm">{item.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Popular Zapier Actions</h3>
                      {[
                        { trigger: 'new_lead', action: 'Save to Google Sheets → Email via Gmail', color: '#0A66C2' },
                        { trigger: 'article_published', action: 'Post to Twitter + LinkedIn simultaneously', color: '#E4405F' },
                        { trigger: 'finance_alert', action: 'Send Slack DM to yourself', color: '#4ade80' },
                        { trigger: 'alpha_result', action: 'Log to Airtable Alpha Database', color: '#a855f7' },
                        { trigger: 'discipline_report', action: 'Email yourself a weekly recap', color: '#f59e0b' },
                      ].map(item => (
                        <div key={item.trigger} className="flex items-center gap-3 bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-3">
                          <span className="font-mono text-xs text-orange-300 bg-orange-500/10 px-2 py-1 rounded shrink-0">{item.trigger}</span>
                          <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                          <span className="text-xs text-slate-300">{item.action}</span>
                        </div>
                      ))}

                      <div className="bg-slate-800/60 border border-gray-200 dark:border-gray-700 border-slate-700 rounded-xl p-4">
                        <p className="text-xs text-slate-400">
                          <span className="text-white font-bold">Pro Tip:</span> You can have multiple Zaps all listening to the same webhook URL. Use the <code className="text-orange-400">event_name</code> field in Zapier's filter step to route different events to different actions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
