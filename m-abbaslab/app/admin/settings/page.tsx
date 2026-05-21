'use client'

import { useState } from 'react'
import { Settings, Wifi, Brain } from 'lucide-react'
import JarvisSettings from '@/components/admin/JarvisSettings'
import WhatsAppConnection from '@/components/admin/WhatsAppConnection'
import JarvisLearning from '@/components/admin/JarvisLearning'

type ActiveSettingsTab = 'general' | 'connection' | 'learning'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<ActiveSettingsTab>('general')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              Jarvis Control Hub
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure system behaviors, track WhatsApp connection socket state, and guide model learning feedback.
            </p>
          </div>

          <div className="flex bg-gray-50 dark:bg-gray-950 p-1 rounded-xl border border-gray-150 dark:border-gray-800 self-start md:self-auto overflow-x-auto">
            {([
              { id: 'general', label: 'Jarvis Settings', Icon: Settings },
              { id: 'connection', label: 'Connection Manager', Icon: Wifi },
              { id: 'learning', label: 'Learning Feedback', Icon: Brain }
            ] as const).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === id
                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/40 dark:border-gray-800'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab panels */}
        <div className="transition-all duration-200">
          {activeTab === 'general' && <JarvisSettings />}
          {activeTab === 'connection' && <WhatsAppConnection />}
          {activeTab === 'learning' && <JarvisLearning />}
        </div>
      </div>
    </div>
  )
}
