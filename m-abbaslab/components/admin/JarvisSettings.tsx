'use client'

import { useEffect, useState } from 'react'
import {
  Settings,
  Sliders,
  MessageSquare,
  Clock,
  Database,
  Save,
  RotateCcw,
  Download,
  Upload,
  Zap,
  Bot,
  SlidersHorizontal
} from 'lucide-react'

type JarvisConfig = {
  enabled: boolean
  respondToGroups: boolean
  monitorStatuses: boolean
  autoLikeStatuses: boolean
  communicationPreferences: {
    formality: number
    verbosity: number
    humor: number
    emoji: number
  }
  schedule: {
    type: 'always' | 'working' | 'non-working' | 'disabled'
    workingHoursStart: string
    workingHoursEnd: string
    timezone: string
  }
  whatsappSettings: {
    respondToDirectMessages: boolean
    respondToGroups: boolean
    logAllMessages: boolean
    maxResponseLength: number
  }
}

const DEFAULT_CONFIG: JarvisConfig = {
  enabled: true,
  respondToGroups: true,
  monitorStatuses: true,
  autoLikeStatuses: true,
  communicationPreferences: {
    formality: 0.5,
    verbosity: 0.5,
    humor: 0.5,
    emoji: 0.5
  },
  schedule: {
    type: 'always',
    workingHoursStart: '08:00',
    workingHoursEnd: '17:00',
    timezone: 'Africa/Nairobi'
  },
  whatsappSettings: {
    respondToDirectMessages: true,
    respondToGroups: true,
    logAllMessages: true,
    maxResponseLength: 512
  }
}

export default function JarvisSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'communication' | 'whatsapp' | 'schedule' | 'backup'>('general')
  const [fullConfig, setFullConfig] = useState<any>({})
  const [jarvisConfig, setJarvisConfig] = useState<JarvisConfig>(DEFAULT_CONFIG)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/config', { cache: 'no-store' })
      if (!response.ok) throw new Error('Failed to load configuration.')
      const data = await response.json()
      setFullConfig(data)
      
      if (data.jarvisConfig) {
        // Merge with defaults to ensure all properties exist
        setJarvisConfig({
          enabled: data.jarvisConfig.enabled !== false,
          respondToGroups: data.jarvisConfig.respondToGroups !== false,
          monitorStatuses: data.jarvisConfig.monitorStatuses !== false,
          autoLikeStatuses: data.jarvisConfig.autoLikeStatuses !== false,
          communicationPreferences: {
            formality: typeof data.jarvisConfig.communicationPreferences?.formality === 'number' ? data.jarvisConfig.communicationPreferences.formality : 0.5,
            verbosity: typeof data.jarvisConfig.communicationPreferences?.verbosity === 'number' ? data.jarvisConfig.communicationPreferences.verbosity : 0.5,
            humor: typeof data.jarvisConfig.communicationPreferences?.humor === 'number' ? data.jarvisConfig.communicationPreferences.humor : 0.5,
            emoji: typeof data.jarvisConfig.communicationPreferences?.emoji === 'number' ? data.jarvisConfig.communicationPreferences.emoji : 0.5
          },
          schedule: {
            type: data.jarvisConfig.schedule?.type || 'always',
            workingHoursStart: data.jarvisConfig.schedule?.workingHoursStart || '08:00',
            workingHoursEnd: data.jarvisConfig.schedule?.workingHoursEnd || '17:00',
            timezone: data.jarvisConfig.schedule?.timezone || 'Africa/Nairobi'
          },
          whatsappSettings: {
            respondToDirectMessages: data.jarvisConfig.whatsappSettings?.respondToDirectMessages !== false,
            respondToGroups: data.jarvisConfig.whatsappSettings?.respondToGroups !== false,
            logAllMessages: data.jarvisConfig.whatsappSettings?.logAllMessages !== false,
            maxResponseLength: Number(data.jarvisConfig.whatsappSettings?.maxResponseLength || 512)
          }
        })
      } else {
        // Fallback or initialize
        setJarvisConfig(DEFAULT_CONFIG)
      }
    } catch (err: any) {
      showToast(err.message || 'Error loading settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleSave = async (updatedConfig = jarvisConfig) => {
    setIsSaving(true)
    try {
      const mergedConfig = {
        ...fullConfig,
        jarvisConfig: updatedConfig,
        // Sync schedule with the main scheduler configuration for backward compatibility
        whatsappBotSchedule: {
          type: updatedConfig.schedule.type,
          workingHoursStart: updatedConfig.schedule.workingHoursStart,
          workingHoursEnd: updatedConfig.schedule.workingHoursEnd,
          timezone: updatedConfig.schedule.timezone
        }
      }

      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mergedConfig)
      })

      const data = await response.json()
      if (data.success) {
        setFullConfig(mergedConfig)
        showToast('Settings saved successfully!')
      } else {
        showToast(data.error || 'Failed to save settings', 'error')
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving settings', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jarvisConfig, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', 'jarvis-config.json')
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    showToast('Configuration exported.')
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader()
    const files = e.target.files
    if (!files || files.length === 0) return

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        // Basic validation
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('Invalid JSON format')
        }
        
        const imported: JarvisConfig = {
          enabled: parsed.enabled !== false,
          respondToGroups: parsed.respondToGroups !== false,
          monitorStatuses: parsed.monitorStatuses !== false,
          autoLikeStatuses: parsed.autoLikeStatuses !== false,
          communicationPreferences: {
            formality: typeof parsed.communicationPreferences?.formality === 'number' ? parsed.communicationPreferences.formality : 0.5,
            verbosity: typeof parsed.communicationPreferences?.verbosity === 'number' ? parsed.communicationPreferences.verbosity : 0.5,
            humor: typeof parsed.communicationPreferences?.humor === 'number' ? parsed.communicationPreferences.humor : 0.5,
            emoji: typeof parsed.communicationPreferences?.emoji === 'number' ? parsed.communicationPreferences.emoji : 0.5
          },
          schedule: {
            type: parsed.schedule?.type || 'always',
            workingHoursStart: parsed.schedule?.workingHoursStart || '08:00',
            workingHoursEnd: parsed.schedule?.workingHoursEnd || '17:00',
            timezone: parsed.schedule?.timezone || 'Africa/Nairobi'
          },
          whatsappSettings: {
            respondToDirectMessages: parsed.whatsappSettings?.respondToDirectMessages !== false,
            respondToGroups: parsed.whatsappSettings?.respondToGroups !== false,
            logAllMessages: parsed.whatsappSettings?.logAllMessages !== false,
            maxResponseLength: Number(parsed.whatsappSettings?.maxResponseLength || 512)
          }
        }

        setJarvisConfig(imported)
        handleSave(imported)
        showToast('Configuration imported and saved successfully!')
      } catch (err) {
        showToast('Failed to import config. Ensure JSON structure is valid.', 'error')
      }
    }
    fileReader.readAsText(files[0])
  }

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all Jarvis settings to default values?')) {
      setJarvisConfig(DEFAULT_CONFIG)
      handleSave(DEFAULT_CONFIG)
      showToast('Settings reset to defaults.')
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 flex justify-center items-center">
        <Clock className="w-6 h-6 text-blue-500 animate-spin mr-3" />
        <span className="text-gray-500 dark:text-gray-400 text-sm">Loading unified settings...</span>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 text-sm font-medium border border-gray-200 dark:border-gray-700 shadow-lg transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/80 dark:border-rose-900 dark:text-rose-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/80 dark:border-emerald-900 dark:text-emerald-200'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50/50 dark:bg-gray-800/20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Jarvis Control Panel
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure system states, communications styles, responders, working schedules, and database backups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Tabs sidebar */}
        <div className="w-full md:w-56 border-r border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50/20 dark:bg-gray-950/20">
          <div className="p-3 space-y-1">
            {([
              { id: 'general', label: 'General', Icon: Bot },
              { id: 'communication', label: 'Communication Style', Icon: Sliders },
              { id: 'whatsapp', label: 'WhatsApp Bot', Icon: MessageSquare },
              { id: 'schedule', label: 'Schedule', Icon: Clock },
              { id: 'backup', label: 'Backup & Restore', Icon: Database }
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Core Settings</h3>
                <div className="space-y-4">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Master Enable</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Global toggle for Jarvis AI services. Disabling this turns off all WhatsApp reply logic.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.enabled}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Group Monitoring */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Group Monitoring</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Jarvis scans and responds to group messages when mentioned.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.respondToGroups}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, respondToGroups: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Status Updates */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Status Monitoring</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Jarvis watches status updates from contacts and runs AI content classifications.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.monitorStatuses}
                        onChange={e => setJarvisConfig(prev => ({ ...prev, monitorStatuses: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Auto Likes */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-100 dark:border-gray-850 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Auto-Like Statuses</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Auto-like (react ❤️) statuses matching categories of interest.
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
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communication Style Tab */}
          {activeTab === 'communication' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">AI Response Preferences</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Fine-tune Jarvis's writing tone sliders to adjust the OpenRouter prompt guidelines.
                </p>
                
                <div className="space-y-5">
                  {/* Formality Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <label className="font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Formality Level</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{jarvisConfig.communicationPreferences.formality * 100}% (Casual ↔ Formal)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={jarvisConfig.communicationPreferences.formality}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        communicationPreferences: { ...prev.communicationPreferences, formality: parseFloat(e.target.value) }
                      }))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Verbosity Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <label className="font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Verbosity / Detail</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{jarvisConfig.communicationPreferences.verbosity * 100}% (Brief ↔ Detailed)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={jarvisConfig.communicationPreferences.verbosity}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        communicationPreferences: { ...prev.communicationPreferences, verbosity: parseFloat(e.target.value) }
                      }))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Humor Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <label className="font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Humor / Playfulness</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{jarvisConfig.communicationPreferences.humor * 100}% (Serious ↔ Witty)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={jarvisConfig.communicationPreferences.humor}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        communicationPreferences: { ...prev.communicationPreferences, humor: parseFloat(e.target.value) }
                      }))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Emoji Usage Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <label className="font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Emoji Density</label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{jarvisConfig.communicationPreferences.emoji * 100}% (None ↔ Rich)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={jarvisConfig.communicationPreferences.emoji}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        communicationPreferences: { ...prev.communicationPreferences, emoji: parseFloat(e.target.value) }
                      }))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Bot Settings */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">WhatsApp Endpoint Behavior</h3>
                <div className="space-y-4">
                  {/* Respond DMs */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Auto-respond to Direct Messages</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        When disabled, direct message auto-replies are paused.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.whatsappSettings.respondToDirectMessages}
                        onChange={e => setJarvisConfig(prev => ({
                          ...prev,
                          whatsappSettings: { ...prev.whatsappSettings, respondToDirectMessages: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Respond Groups */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Auto-respond in Groups</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Respond in groups when mentioned or asked questions.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.whatsappSettings.respondToGroups}
                        onChange={e => setJarvisConfig(prev => ({
                          ...prev,
                          whatsappSettings: { ...prev.whatsappSettings, respondToGroups: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Log Messages */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <div className="space-y-1 pr-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Log All Incoming Messages</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Logs all WhatsApp conversations to Supabase (even if Jarvis skips answering).
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jarvisConfig.whatsappSettings.logAllMessages}
                        onChange={e => setJarvisConfig(prev => ({
                          ...prev,
                          whatsappSettings: { ...prev.whatsappSettings, logAllMessages: e.target.checked }
                        }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:bg-gray-800 after:border-gray-300 after:border border-gray-200 dark:border-gray-700 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Max Length */}
                  <div className="space-y-1.5 p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                    <label className="block text-sm font-bold text-gray-900 dark:text-white">Max Response Character Count</label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Max token cutoff for generating replies (defaults to 512).</p>
                    <input
                      type="number"
                      value={jarvisConfig.whatsappSettings.maxResponseLength}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        whatsappSettings: { ...prev.whatsappSettings, maxResponseLength: parseInt(e.target.value) || 512 }
                      }))}
                      className="w-full md:w-48 px-3 py-2 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">Availability Schedule</h3>
                
                <div className="space-y-4">
                  {/* Schedule Type */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Active Window Type</label>
                    <select
                      value={jarvisConfig.schedule.type}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, type: e.target.value as any }
                      }))}
                      className="w-full md:w-64 px-3 py-2.5 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="always">Always Active (24/7)</option>
                      <option value="working">Active during Working Hours only</option>
                      <option value="non-working">Active during Non-Working Hours only</option>
                      <option value="disabled">Disabled Entirely</option>
                    </select>
                  </div>

                  {/* Hours inputs */}
                  {jarvisConfig.schedule.type !== 'always' && jarvisConfig.schedule.type !== 'disabled' && (
                    <div className="grid grid-cols-2 gap-4 max-w-md p-4 rounded-xl border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Working Hours Start</label>
                        <input
                          type="time"
                          value={jarvisConfig.schedule.workingHoursStart}
                          onChange={e => setJarvisConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, workingHoursStart: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-805 rounded-xl bg-white dark:bg-gray-900 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Working Hours End</label>
                        <input
                          type="time"
                          value={jarvisConfig.schedule.workingHoursEnd}
                          onChange={e => setJarvisConfig(prev => ({
                            ...prev,
                            schedule: { ...prev.schedule, workingHoursEnd: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-805 rounded-xl bg-white dark:bg-gray-900 text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Timezone */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 dark:text-gray-600 dark:text-gray-300">Timezone Selector</label>
                    <select
                      value={jarvisConfig.schedule.timezone}
                      onChange={e => setJarvisConfig(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, timezone: e.target.value }
                      }))}
                      className="w-full md:w-64 px-3 py-2.5 border border-gray-200 dark:border-gray-700 border-gray-250 dark:border-gray-850 rounded-xl bg-white dark:bg-gray-900 text-sm focus:outline-none"
                    >
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                      <option value="Africa/Cairo">Africa/Cairo (EET, UTC+2)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="America/New_York">America/New_York (EST/EDT)</option>
                      <option value="UTC">Coordinated Universal Time (UTC)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup and Restore Tab */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">Configuration Backup</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                  Export settings to local file backups or restore configuration states.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Export */}
                  <div className="p-5 border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-950 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-blue-500" />
                        Export Settings
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Downloads a JSON copy of all communication settings.
                      </div>
                    </div>
                    <button
                      onClick={handleExport}
                      className="w-full md:w-auto self-start inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                    >
                      Export JSON Configuration
                    </button>
                  </div>

                  {/* Import */}
                  <div className="p-5 border border-gray-200 dark:border-gray-700 border-gray-150 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-950 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-500" />
                        Import Settings
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Uploads and overwrites settings from an exported config JSON file.
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        id="import-config-file"
                        className="hidden"
                      />
                      <label
                        htmlFor="import-config-file"
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        Upload and Import JSON
                      </label>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-150 dark:border-gray-800 my-6" />

                {/* Reset to Defaults */}
                <div className="p-5 border border-gray-200 dark:border-gray-700 border-rose-100 dark:border-rose-950/40 rounded-2xl bg-rose-50/20 dark:bg-rose-950/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4" />
                      Reset to Factory Defaults
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Restores all Jarvis preferences to initial settings. This action is irreversible.
                    </div>
                  </div>
                  <button
                    onClick={handleResetDefaults}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Reset All Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
