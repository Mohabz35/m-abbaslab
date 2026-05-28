'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  MessageSquare,
  Radio,
  RefreshCw,
  Save,
  SlidersHorizontal,
  WifiOff,
  Zap,
  Smartphone,
  Send,
  Users,
  TrendingUp,
  Clock,
  Globe,
  PhoneCall,
  Hash,
  BarChart2,
  Wifi,
  XCircle,
  Info,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import JarvisInbox from '@/components/admin/JarvisInbox'
import JarvisBrain from '@/components/admin/JarvisBrain'
import JarvisAdvanced from '@/components/admin/JarvisAdvanced'
import JarvisLearning from '@/components/admin/JarvisLearning'
import WhatsAppBroadcaster from '@/components/admin/WhatsAppBroadcaster'
import WhatsAppTestConsole from '@/components/admin/WhatsAppTestConsole'
import { hasSupabaseKeys, supabase } from '@/lib/supabase'

type Rule = {
  keyword: string
  response: string
}

type BotSchedule = {
  type: 'always' | 'working' | 'non-working' | 'disabled'
  workingHoursStart: string
  workingHoursEnd: string
  timezone: string
}

type ConnectionStatus = {
  status?: string
  service?: string
  is_connected?: boolean
  connection_state?: string
  reconnect_attempts?: number
  last_connected_at?: string | null
  last_disconnected_at?: string | null
  last_error?: string | null
  updated_at?: string | null
  source?: string
}

const DEFAULT_SCHEDULE: BotSchedule = {
  type: 'always',
  workingHoursStart: '08:00',
  workingHoursEnd: '17:00',
  timezone: 'Africa/Nairobi',
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || ''

function authHeaders() {
  const headers: Record<string, string> = {}
  if (ADMIN_SECRET) headers['x-admin-secret'] = ADMIN_SECRET
  return headers
}

const TABS = [
  { id: 'overview',    label: 'Overview',       Icon: Activity },
  { id: 'inbox',       label: 'Inbox',          Icon: MessageSquare },
  { id: 'broadcast',   label: 'Broadcast',      Icon: Send },
  { id: 'sandbox',     label: 'Bot Sandbox',    Icon: Smartphone },
  { id: 'brain',       label: 'Brain Training', Icon: Brain },
  { id: 'connection',  label: 'Connection',     Icon: Radio },
  { id: 'advanced',   label: 'Advanced',       Icon: Bot },
  { id: 'learning',    label: 'Learning',       Icon: SlidersHorizontal },
] as const

type TabId = typeof TABS[number]['id']

// ─── Small Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex items-center gap-4`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
      </div>
    </div>
  )
}

// ─── Connection Status Badge ────────────────────────────────────────────────
function ConnectionBadge({ connected, state }: { connected: boolean; state: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
      connected
        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }`}>
      <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
      {connected ? 'CONNECTED' : state.toUpperCase()}
    </div>
  )
}

// ─── WhatsApp API Explainer ─────────────────────────────────────────────────
function WhatsAppConnectGuide() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-400" /> WhatsApp Connection — Your Options
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-2">
          <div className="font-bold text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Option 1 — Baileys + VPS</div>
          <p className="text-sm text-slate-300">Run Baileys (your existing WhatsApp engine) on a cheap $5/mo VPS (DigitalOcean, Railway, or a spare machine at home). Connect it to Supabase — done.</p>
          <div className="text-xs text-emerald-300 font-bold">✅ Free / very cheap. Already configured in your codebase.</div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-2">
          <div className="font-bold text-amber-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Option 2 — Meta Cloud API</div>
          <p className="text-sm text-slate-300">Official WhatsApp Business Cloud API — works 100% on Vercel. No persistent server needed. Requires a Meta Business Account + phone number approval.</p>
          <div className="text-xs text-amber-300 font-bold">⚠️ $0.01-0.08 per conversation. Business verification required.</div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 space-y-2">
          <div className="font-bold text-blue-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Option 3 — Render.com (Current)</div>
          <p className="text-sm text-slate-300">Your existing Render-hosted Baileys engine. Just ensure it stays running. The dashboard connects to it via the engine URL in settings.</p>
          <div className="text-xs text-blue-300 font-bold">✅ Already working. Engine URL needs to be healthy.</div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
        <p className="text-sm text-slate-400">
          <span className="text-white font-bold">Recommendation: </span>
          Keep using Render.com for now since it's already connected. Once you are ready to scale, switch to the official Meta Cloud API for a serverless, scalable setup.
        </p>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function CommsHub() {
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [baseConfig, setBaseConfig] = useState<any>(null)
  const [rules, setRules] = useState<Rule[]>([])
  const [schedule, setSchedule] = useState<BotSchedule>(DEFAULT_SCHEDULE)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null)
  const [statusSource, setStatusSource] = useState<string>('unknown')
  const [engineUrl, setEngineUrl] = useState<string | null>(null)
  const [totalMessages, setTotalMessages] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [isTriggeringReconnect, setIsTriggeringReconnect] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type })
    window.setTimeout(() => setNotice(null), 3500)
  }

  const fetchConfig = async () => {
    try {
      setIsLoadingConfig(true)
      const response = await fetch('/api/admin/config', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load communication config.')
      const config = await response.json()
      setBaseConfig(config)
      setRules(config.jarvisTraining || [])
      setSchedule(config.whatsappBotSchedule || DEFAULT_SCHEDULE)
    } catch (error: any) {
      showNotice(error?.message || 'Failed to load communication config.', 'error')
    } finally {
      setIsLoadingConfig(false)
    }
  }

  const fetchStatus = async () => {
    try {
      setIsRefreshingStatus(true)
      const response = await fetch('/api/admin/whatsapp-status', {
        headers: authHeaders(),
        cache: 'no-store',
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Connection status unavailable.')
      setConnectionStatus(data.status || null)
      setStatusSource(data.source || 'unknown')
      setEngineUrl(data.engineUrl || null)
    } catch (error: any) {
      setConnectionStatus(null)
      setStatusSource('unknown')
    } finally {
      setIsRefreshingStatus(false)
    }
  }

  const fetchMessageStats = async () => {
    if (!hasSupabaseKeys) return
    const totalRes = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true })
    const unreadRes = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
    setTotalMessages(totalRes.count || 0)
    setUnreadMessages(unreadRes.count || 0)
  }

  useEffect(() => {
    fetchConfig()
    fetchStatus()
    fetchMessageStats()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => fetchStatus(), 30000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!hasSupabaseKeys) return

    const messageChannel = supabase
      .channel('comms-hub-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_messages' }, () => fetchMessageStats())
      .subscribe()

    const statusChannel = supabase
      .channel('comms-hub-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_connection_status' }, (payload) => {
        setConnectionStatus(payload.new as ConnectionStatus)
        setStatusSource('supabase')
      })
      .subscribe()

    return () => {
      supabase.removeChannel(messageChannel)
      supabase.removeChannel(statusChannel)
    }
  }, [])

  const handleSaveBrain = async () => {
    if (!baseConfig) return
    try {
      setIsSavingConfig(true)
      const payload = { ...baseConfig, jarvisTraining: rules, whatsappBotSchedule: schedule }
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Failed to save.')
      setBaseConfig(payload)
      showNotice('Jarvis brain and schedule saved successfully.')
    } catch (error: any) {
      showNotice(error?.message || 'Failed to save.', 'error')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleReconnect = async () => {
    try {
      setIsTriggeringReconnect(true)
      const response = await fetch('/api/admin/whatsapp-status', { method: 'POST', headers: authHeaders() })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.error || 'Reconnect request failed.')
      showNotice('Reconnect signal sent to the WhatsApp engine.')
      await fetchStatus()
    } catch (error: any) {
      showNotice(error?.message || 'Failed to trigger reconnect.', 'error')
    } finally {
      setIsTriggeringReconnect(false)
    }
  }

  const isConnected = Boolean(connectionStatus?.is_connected)
  const connectionState = connectionStatus?.connection_state || connectionStatus?.status || 'unknown'

  const tabBadge = (id: TabId) => {
    if (id === 'inbox') return unreadMessages
    return 0
  }

  return (
    <div className="space-y-5">
      {/* Global Notice */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl px-4 py-3 text-sm border flex items-center gap-2 ${
              notice.type === 'error'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {notice.type === 'error' ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-blue-400" />
            </div>
            Comms Hub
          </h2>
          <p className="text-sm text-slate-400 mt-1">Unified WhatsApp control center — inbox, bot engine, broadcasts, and analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge connected={isConnected} state={connectionState} />
          <button
            onClick={() => { fetchStatus(); fetchMessageStats() }}
            className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-slate-900/60 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Tab Bar */}
        <div className="flex gap-0 overflow-x-auto border-b border-slate-700 bg-slate-800/40 px-2">
          {TABS.map(({ id, label, Icon }) => {
            const badge = tabBadge(id)
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap shrink-0 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {badge > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] inline-flex items-center justify-center font-bold">
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Messages" value={totalMessages} icon={MessageSquare} color="bg-blue-500/20 text-blue-400" />
                    <StatCard label="Unread" value={unreadMessages} icon={Hash} color="bg-rose-500/20 text-rose-400" />
                    <StatCard label="Bot Rules" value={rules.length} icon={Brain} color="bg-purple-500/20 text-purple-400" />
                    <StatCard label="Engine State" value={isConnected ? 'Online' : 'Offline'} icon={isConnected ? Wifi : WifiOff} color={isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'} />
                  </div>

                  {/* Connection Details Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
                      <h3 className="font-bold text-white flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-400" /> Engine Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-slate-400">State</span><span className="text-white font-bold">{connectionState}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Source</span><span className="text-white">{statusSource}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Reconnect Attempts</span><span className="text-amber-400 font-bold">{connectionStatus?.reconnect_attempts || 0}</span></div>
                        <div className="flex justify-between"><span className="text-slate-400">Last Connected</span><span className="text-white text-xs">{connectionStatus?.last_connected_at ? new Date(connectionStatus.last_connected_at).toLocaleString() : 'N/A'}</span></div>
                      </div>
                      <button onClick={handleReconnect} disabled={isTriggeringReconnect} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors mt-2">
                        <RefreshCw className={`w-4 h-4 ${isTriggeringReconnect ? 'animate-spin' : ''}`} />
                        {isTriggeringReconnect ? 'Reconnecting...' : 'Trigger Reconnect'}
                      </button>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 space-y-3">
                      <h3 className="font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> Quick Navigation</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {TABS.filter(t => t.id !== 'overview').map(({ id, label, Icon }) => (
                          <button key={id} onClick={() => setActiveTab(id)} className="flex items-center gap-2 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-sm transition-colors border border-slate-600 hover:border-slate-500">
                            <Icon className="w-4 h-4 shrink-0" /> {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Error banner */}
                  {connectionStatus?.last_error && (
                    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-rose-400">Engine Error Detected</p>
                        <p className="text-sm text-rose-300 mt-1">{connectionStatus.last_error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INBOX TAB */}
              {activeTab === 'inbox' && <JarvisInbox />}

              {/* BROADCAST TAB */}
              {activeTab === 'broadcast' && (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">
                      <strong>Requires a live WhatsApp engine.</strong> Broadcasts are sent via your Render/Baileys engine. If the status is "Disconnected", messages will fail silently. Check the Connection tab first.
                    </p>
                  </div>
                  <WhatsAppBroadcaster />
                </div>
              )}

              {/* SANDBOX TAB */}
              {activeTab === 'sandbox' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                    <Smartphone className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-300">
                      <strong>Bot Sandbox:</strong> Simulate sending and receiving WhatsApp messages to test your bot responses before going live. The sandbox echoes messages locally — no real WhatsApp messages are sent here.
                    </p>
                  </div>
                  <WhatsAppTestConsole />
                </div>
              )}

              {/* BRAIN TRAINING TAB */}
              {activeTab === 'brain' && (
                <div className="space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white">Jarvis Brain Training</h3>
                      <p className="text-sm text-slate-400 mt-1">Add keyword-response rules and configure the bot's active schedule.</p>
                    </div>
                    <button
                      onClick={handleSaveBrain}
                      disabled={isSavingConfig || isLoadingConfig}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingConfig ? 'Saving...' : 'Save Training'}
                    </button>
                  </div>
                  <JarvisBrain rules={rules} onChange={setRules} schedule={schedule} onScheduleChange={setSchedule} />
                </div>
              )}

              {/* CONNECTION TAB */}
              {activeTab === 'connection' && (
                <div className="space-y-6">
                  <WhatsAppConnectGuide />

                  <div className="border-t border-slate-700 pt-6 space-y-4">
                    <h3 className="font-bold text-white">Live Engine Diagnostics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Engine State', value: connectionState },
                        { label: 'Data Source', value: statusSource },
                        { label: 'Reconnect Attempts', value: connectionStatus?.reconnect_attempts || 0 },
                        { label: 'Last Updated', value: connectionStatus?.updated_at ? new Date(connectionStatus.updated_at).toLocaleString() : 'Unknown' },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                          <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">{item.label}</p>
                          <p className="text-sm font-bold text-white">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {engineUrl && (
                      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Engine URL</p>
                        <a href={engineUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm break-all">{engineUrl}</a>
                      </div>
                    )}

                    {connectionStatus?.last_error && (
                      <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4">
                        <p className="text-xs text-rose-400 uppercase tracking-widest font-bold mb-1">Last Error</p>
                        <p className="text-sm text-rose-300">{connectionStatus.last_error}</p>
                      </div>
                    )}

                    <button
                      onClick={handleReconnect}
                      disabled={isTriggeringReconnect}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTriggeringReconnect ? 'animate-spin' : ''}`} />
                      {isTriggeringReconnect ? 'Reconnecting...' : 'Reconnect Now'}
                    </button>
                  </div>
                </div>
              )}

              {/* ADVANCED TAB */}
              {activeTab === 'advanced' && <JarvisAdvanced />}

              {/* LEARNING TAB */}
              {activeTab === 'learning' && <JarvisLearning />}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
