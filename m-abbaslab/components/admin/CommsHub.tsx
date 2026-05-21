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
} from 'lucide-react'
import JarvisInbox from '@/components/admin/JarvisInbox'
import JarvisBrain from '@/components/admin/JarvisBrain'
import JarvisAdvanced from '@/components/admin/JarvisAdvanced'
import JarvisLearning from '@/components/admin/JarvisLearning'
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
  if (ADMIN_SECRET) {
    headers['x-admin-secret'] = ADMIN_SECRET
  }
  return headers
}

export default function CommsHub() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'brain' | 'connection' | 'advanced' | 'learning' | 'analytics'>('inbox')
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
      const response = await fetch('/api/admin/config', {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Failed to load communication config.')
      }

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
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Connection status unavailable.')
      }

      setConnectionStatus(data.status || null)
      setStatusSource(data.source || 'unknown')
      setEngineUrl(data.engineUrl || null)
    } catch (error: any) {
      setConnectionStatus(null)
      setStatusSource('unknown')
      showNotice(error?.message || 'Failed to load connection status.', 'error')
    } finally {
      setIsRefreshingStatus(false)
    }
  }

  const fetchMessageStats = async () => {
    if (!hasSupabaseKeys) return

    const totalRes = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })

    const unreadRes = await supabase
      .from('whatsapp_messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    setTotalMessages(totalRes.count || 0)
    setUnreadMessages(unreadRes.count || 0)
  }

  useEffect(() => {
    fetchConfig()
    fetchStatus()
    fetchMessageStats()
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchStatus()
    }, 30000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!hasSupabaseKeys) return

    const messageChannel = supabase
      .channel('comms-hub-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages' },
        () => {
          fetchMessageStats()
        }
      )
      .subscribe()

    const statusChannel = supabase
      .channel('comms-hub-status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_connection_status' },
        (payload) => {
          setConnectionStatus(payload.new as ConnectionStatus)
          setStatusSource('supabase')
        }
      )
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
      const payload = {
        ...baseConfig,
        jarvisTraining: rules,
        whatsappBotSchedule: schedule,
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save brain training config.')
      }

      setBaseConfig(payload)
      showNotice('Jarvis brain and WhatsApp schedule saved.')
    } catch (error: any) {
      showNotice(error?.message || 'Failed to save communication config.', 'error')
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleReconnect = async () => {
    try {
      setIsTriggeringReconnect(true)
      const response = await fetch('/api/admin/whatsapp-status', {
        method: 'POST',
        headers: authHeaders(),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Reconnect request failed.')
      }

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

  return (
    <div className="space-y-5">
      {!isConnected && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-700 dark:text-amber-300">WhatsApp engine needs attention</div>
            <div className="text-sm text-amber-600 dark:text-amber-400">
              The connection is not reporting as healthy. Open the Connection tab to inspect status or trigger a reconnect.
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div
          className={`rounded-xl px-4 py-3 text-sm border ${
            notice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/10 dark:border-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-800 dark:text-emerald-300'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
              <Zap className="w-5 h-5 text-blue-500" />
              Comms Hub
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Unified inbox, Jarvis training, engine status, and communication analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${
              isConnected
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/10 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {isConnected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {connectionState}
            </div>
            <button
              onClick={fetchStatus}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="px-4 border-b border-gray-100 dark:border-gray-800 flex gap-1 overflow-x-auto">
          {([
            { id: 'inbox', label: 'Inbox', Icon: MessageSquare, badge: unreadMessages },
            { id: 'brain', label: 'Brain Training', Icon: Brain, badge: 0 },
            { id: 'connection', label: 'Connection', Icon: Radio, badge: 0 },
            { id: 'advanced', label: 'Advanced', Icon: Bot, badge: 0 },
            { id: 'learning', label: 'Learning', Icon: SlidersHorizontal, badge: 0 },
            { id: 'analytics', label: 'Analytics', Icon: Activity, badge: 0 },
          ] as const).map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {typeof badge === 'number' && badge > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] inline-flex items-center justify-center">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'inbox' && <JarvisInbox />}

          {activeTab === 'brain' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">Jarvis Brain Training</h3>
                  <p className="text-sm text-gray-500">Update keyword rules and WhatsApp activity windows from one place.</p>
                </div>
                <button
                  onClick={handleSaveBrain}
                  disabled={isSavingConfig || isLoadingConfig}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSavingConfig ? 'Saving...' : 'Save Training'}
                </button>
              </div>

              <JarvisBrain
                rules={rules}
                onChange={setRules}
                schedule={schedule}
                onScheduleChange={setSchedule}
              />
            </div>
          )}

          {activeTab === 'connection' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Engine State</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{connectionState}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Source</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{statusSource}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Reconnect Attempts</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{connectionStatus?.reconnect_attempts || 0}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Status Updated</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {connectionStatus?.updated_at ? new Date(connectionStatus.updated_at).toLocaleString() : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Engine Control</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Trigger a reconnect if the Render-hosted engine drops its session or stops reporting healthy state.
                    </p>
                    {engineUrl && (
                      <p className="text-xs text-gray-400 mt-2">
                        Engine URL: {engineUrl}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleReconnect}
                    disabled={isTriggeringReconnect}
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTriggeringReconnect ? 'animate-spin' : ''}`} />
                    {isTriggeringReconnect ? 'Reconnecting...' : 'Reconnect Now'}
                  </button>
                </div>

                {connectionStatus?.last_error && (
                  <div className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 px-4 py-3">
                    <div className="text-xs uppercase tracking-wider font-bold text-rose-500 mb-1">Last Error</div>
                    <div className="text-sm text-rose-600 dark:text-rose-300">{connectionStatus.last_error}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Total Messages</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalMessages}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Unread</div>
                  <div className="text-2xl font-bold text-rose-500">{unreadMessages}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Training Rules</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{rules.length}</div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/40">
                  <div className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-2">Connection</div>
                  <div className={`text-lg font-bold ${isConnected ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Jarvis Activity</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    The inbox and brain training modules are live inside this hub. Realtime unread counts rely on Supabase and engine status uses the new status API.
                  </p>
                </div>

                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-3">
                    <Radio className="w-4 h-4 text-green-500" />
                    <h3 className="font-bold text-gray-900 dark:text-white">Connection Insights</h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Last connected: {connectionStatus?.last_connected_at ? new Date(connectionStatus.last_connected_at).toLocaleString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last disconnected: {connectionStatus?.last_disconnected_at ? new Date(connectionStatus.last_disconnected_at).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && <JarvisAdvanced />}

          {activeTab === 'learning' && <JarvisLearning />}
        </div>
      </div>
    </div>
  )
}
