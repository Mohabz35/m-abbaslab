'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Heart,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  Zap,
  CheckCircle,
  MessageSquare,
  Award,
  Compass,
  Smile,
  Flame,
  Briefcase,
  Layers
} from 'lucide-react'

type Group = {
  group_jid: string
  group_name: string
  participant_count: number
  metadata: {
    monitored?: boolean
  }
  last_seen_at?: string
}

type StatusUpdate = {
  id: string
  contact_number: string
  status_text: string
  media_url: string
  jarvis_liked?: boolean
  metadata: {
    category?: 'achievement' | 'travel' | 'celebration' | 'motivation' | 'work' | 'other'
    analysis?: string
    auto_liked?: boolean
    timestamp?: string
  }
  captured_at: string
}

type Stats = {
  totalGroups: number
  monitoredGroups: number
  totalStatuses: number
  likedStatuses: number
}

export default function JarvisAdvanced() {
  const [subTab, setSubTab] = useState<'groups' | 'statuses' | 'settings'>('groups')
  const [groups, setGroups] = useState<Group[]>([])
  const [statuses, setStatuses] = useState<StatusUpdate[]>([])
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    monitoredGroups: 0,
    totalStatuses: 0,
    likedStatuses: 0
  })

  const [jarvisConfig, setJarvisConfig] = useState({
    respondToGroups: true,
    monitorStatuses: true,
    autoLikeStatuses: true
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAnalytics = async (silent = false) => {
    if (!silent) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const response = await fetch('/api/admin/jarvis/group-analytics', {
        cache: 'no-store'
      })
      const data = await response.json()
      if (data.success) {
        setGroups(data.groups)
        setStatuses(data.statuses)
        setStats(data.stats)
      } else {
        showToast(data.error || 'Failed to fetch analytics', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading analytics', 'error')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config', { cache: 'no-store' })
      const data = await response.json()
      if (data && data.jarvisConfig) {
        setJarvisConfig({
          respondToGroups: data.jarvisConfig.respondToGroups !== false,
          monitorStatuses: data.jarvisConfig.monitorStatuses !== false,
          autoLikeStatuses: data.jarvisConfig.autoLikeStatuses !== false
        })
      }
    } catch (err) {
      console.warn('Failed to load Jarvis configuration:', err)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchConfig()
  }, [])

  const handleToggleGroup = async (groupJid: string, currentMonitored: boolean) => {
    const nextMonitored = !currentMonitored
    
    // Optimistic Update
    setGroups(prev =>
      prev.map(g =>
        g.group_jid === groupJid
          ? { ...g, metadata: { ...g.metadata, monitored: nextMonitored } }
          : g
      )
    )

    try {
      const response = await fetch('/api/admin/jarvis/group-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupJid, monitored: nextMonitored })
      })
      const data = await response.json()
      if (!data.success) {
        // Rollback
        setGroups(prev =>
          prev.map(g =>
            g.group_jid === groupJid
              ? { ...g, metadata: { ...g.metadata, monitored: currentMonitored } }
              : g
          )
        )
        showToast(data.error || 'Failed to update group setting', 'error')
      } else {
        showToast(`Group monitoring ${nextMonitored ? 'enabled' : 'disabled'}.`)
        fetchAnalytics(true)
      }
    } catch (err: any) {
      // Rollback
      setGroups(prev =>
        prev.map(g =>
          g.group_jid === groupJid
            ? { ...g, metadata: { ...g.metadata, monitored: currentMonitored } }
            : g
        )
      )
      showToast(err.message || 'Error toggling group monitoring', 'error')
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    try {
      // Fetch full config first to preserve other sections
      const configRes = await fetch('/api/admin/config', { cache: 'no-store' })
      const configData = await configRes.json()

      const updatedConfig = {
        ...configData,
        jarvisConfig: {
          ...(configData?.jarvisConfig || {}),
          respondToGroups: jarvisConfig.respondToGroups,
          monitorStatuses: jarvisConfig.monitorStatuses,
          autoLikeStatuses: jarvisConfig.autoLikeStatuses
        }
      }

      const saveRes = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      })
      const saveResult = await saveRes.json()

      if (saveResult.success) {
        showToast('Advanced features configuration saved.')
      } else {
        showToast(saveResult.error || 'Failed to save configuration', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'achievement':
        return <Award className="w-4 h-4 text-amber-500" />
      case 'travel':
        return <Compass className="w-4 h-4 text-teal-500" />
      case 'celebration':
        return <Smile className="w-4 h-4 text-pink-500" />
      case 'motivation':
        return <Flame className="w-4 h-4 text-orange-500" />
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-500" />
      default:
        return <Layers className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border shadow-lg transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header and Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-500" />
            Advanced Features
          </h3>
          <p className="text-sm text-gray-400">
            Control Jarvis's group auto-responses, monitor contact status updates, and configure AI auto-likes.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={isRefreshing}
          className="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Groups</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalGroups}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Monitored Groups</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.monitoredGroups}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Statuses Analyzed</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">{stats.totalStatuses}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Auto-Likes Sent</div>
          <div className="text-xl font-bold text-rose-500 mt-1 flex items-center gap-1">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            {stats.likedStatuses}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex gap-2">
        <button
          onClick={() => setSubTab('groups')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${
            subTab === 'groups'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Groups Dashboard
        </button>
        <button
          onClick={() => setSubTab('statuses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${
            subTab === 'statuses'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          Status Analysis
        </button>
        <button
          onClick={() => setSubTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-colors -mb-px ${
            subTab === 'settings'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Features Settings
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="ml-3 text-sm text-gray-400">Loading details...</span>
          </div>
        ) : (
          <>
            {/* Groups Tab */}
            {subTab === 'groups' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">WhatsApp Groups Discovered</h4>
                </div>
                {groups.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">
                    No WhatsApp groups discovered yet. Ensure Jarvis engine is running and active in groups.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150 dark:divide-gray-800">
                    {groups.map(group => {
                      const monitored = group.metadata?.monitored !== false
                      return (
                        <div key={group.group_jid} className="p-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <div className="space-y-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white">{group.group_name}</div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span>JID: {group.group_jid}</span>
                              <span>•</span>
                              <span>Participants: {group.participant_count}</span>
                              {group.last_seen_at && (
                                <>
                                  <span>•</span>
                                  <span>Last seen: {new Date(group.last_seen_at).toLocaleTimeString()}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              monitored
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-400'
                            }`}>
                              {monitored ? 'Monitored' : 'Ignored'}
                            </span>
                            <button
                              onClick={() => handleToggleGroup(group.group_jid, monitored)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                monitored
                                  ? 'border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10'
                                  : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                              title={monitored ? 'Disable Monitoring' : 'Enable Monitoring'}
                            >
                              {monitored ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Statuses Tab */}
            {subTab === 'statuses' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-150 dark:border-gray-800">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">WhatsApp Status Analytics Log</h4>
                </div>
                {statuses.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">
                    No status updates analyzed yet. Ensure status monitoring is enabled and contacts upload statuses.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-150 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
                    {statuses.map(status => {
                      const category = status.metadata?.category || 'other'
                      const analysis = status.metadata?.analysis || 'Analyzed'
                      const isLiked = status.jarvis_liked === true || status.metadata?.auto_liked === true
                      const date = new Date(status.captured_at)

                      return (
                        <div key={status.id} className="p-4 space-y-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {status.contact_number?.split('@')[0]}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                {date.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {getCategoryIcon(category)}
                                <span className="capitalize ml-1">{category}</span>
                              </span>

                              {isLiked && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900">
                                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                                  Liked
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-950 p-2.5 rounded-xl border border-gray-100 dark:border-gray-850">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status Content</div>
                            <p className="line-clamp-2">{status.status_text}</p>
                          </div>

                          <div className="text-xs text-gray-400 flex items-start gap-1">
                            <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-bold text-gray-600 dark:text-gray-400">Jarvis analysis: </span>
                              {analysis}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Feature Settings Tab */}
            {subTab === 'settings' && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Configure Advanced Features</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Control engine permissions. Turning features off halts background routines immediately.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Group Monitoring */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Respond to Group Chats</div>
                      <div className="text-xs text-gray-400">
                        When enabled, Jarvis responds to questions or mentions in monitored groups.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.respondToGroups}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, respondToGroups: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Status Monitoring */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Monitor Contacts' Status Updates</div>
                      <div className="text-xs text-gray-400">
                        Jarvis scans and analyzes statuses every 2 minutes for classification insights.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.monitorStatuses}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, monitorStatuses: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Auto-Like Statuses */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Auto-Like Interesting Statuses</div>
                      <div className="text-xs text-gray-400">
                        Automatically react with a heart (❤️) if AI determines status content is interesting.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.autoLikeStatuses}
                        disabled={!jarvisConfig.monitorStatuses}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, autoLikeStatuses: e.target.checked }))}
                        className="sr-only peer disabled:opacity-50"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-755 hover:shadow-md transition-all disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving Settings...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
