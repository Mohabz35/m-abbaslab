'use client'

import { useEffect, useMemo, useState } from 'react'
import { Send, Users, MessageSquare, AlertCircle, RefreshCw, Wand2 } from 'lucide-react'

type Subscriber = {
  id: string
  phone_number: string
  name?: string | null
}

type Broadcast = {
  id: string
  message: string
  total_recipients: number
  successful: number
  failed: number
  status: 'pending' | 'sending' | 'completed' | 'failed' | 'cancelled'
  created_at: string
  completed_at?: string | null
}

const QUICK_TEMPLATES = [
  'Quick update: New article is live on M-AbbasLab. Reply "link" and I will send it.',
  'Community update: A new AI research summary has just been published. Check the latest post.',
  'Heads up: We are rolling out a new feature this week. Stay tuned for details.',
]

function apiHeaders() {
  return {
    'Content-Type': 'application/json',
  }
}

export default function WhatsAppBroadcaster() {
  const [message, setMessage] = useState('')
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sendToAll, setSendToAll] = useState(true)
  const [history, setHistory] = useState<Broadcast[]>([])
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectedCount = useMemo(() => {
    return sendToAll ? subscribers.length : selectedIds.length
  }, [sendToAll, subscribers.length, selectedIds.length])

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ text, type })
    window.setTimeout(() => setStatusNotice(null), 3500)
  }

  const fetchSubscribers = async () => {
    try {
      setIsRefreshing(true)
      const res = await fetch('/api/admin/whatsapp-broadcast?action=subscribers', {
      })
      const data = await res.json()
      if (data.success) {
        setSubscribers(data.subscribers || [])
      } else {
        showNotice(data.error || 'Failed to load subscribers.', 'error')
      }
    } catch {
      showNotice('Failed to load subscribers.', 'error')
    } finally {
      setIsRefreshing(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/admin/whatsapp-broadcast?action=history', {
      })
      const data = await res.json()
      if (data.success) {
        setHistory(data.broadcasts || [])
      }
    } catch {
      // history is non-critical
    }
  }

  useEffect(() => {
    fetchSubscribers()
    fetchHistory()
  }, [])

  const handleSend = async () => {
    if (!message.trim()) {
      showNotice('Enter a message first.', 'error')
      return
    }
    if (!sendToAll && selectedIds.length === 0) {
      showNotice('Select recipients or enable send-to-all.', 'error')
      return
    }

    setIsSending(true)
    try {
      const res = await fetch('/api/admin/whatsapp-broadcast', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          message: message.trim(),
          recipientIds: sendToAll ? undefined : selectedIds,
          sendToAll,
        }),
      })

      const data = await res.json()
      if (data.success) {
        showNotice(`Broadcast sent: ${data.results.successful}/${data.results.total} successful.`)
        setMessage('')
        setSelectedIds([])
        fetchHistory()
      } else {
        showNotice(data.error || 'Failed to send broadcast.', 'error')
      }
    } catch {
      showNotice('Failed to send broadcast.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <MessageSquare className="w-5 h-5 text-green-500" />
          WhatsApp Broadcast
        </h2>
        <button
          onClick={() => {
            fetchSubscribers()
            fetchHistory()
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Refresh subscribers"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {statusNotice && (
        <div
          className={`text-sm px-3 py-2 rounded-lg border ${
            statusNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300'
          }`}
        >
          {statusNotice.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your broadcast message..."
          rows={4}
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-green-500"
        />
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400">{message.length} characters</p>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Wand2 className="w-3.5 h-3.5" />
            Quick templates
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_TEMPLATES.map((template, index) => (
            <button
              key={template}
              onClick={() => setMessage(template)}
              title={template}
              className="text-xs px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-green-400 hover:text-green-600 transition-colors"
            >
              {`Template ${index + 1}`}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sendToAll}
          onChange={(e) => setSendToAll(e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Send to all active subscribers ({subscribers.length})
        </span>
      </label>

      {!sendToAll && (
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
            Select recipients ({selectedIds.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
            {subscribers.map((subscriber) => (
              <label key={subscriber.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(subscriber.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds((prev) => [...prev, subscriber.id])
                    } else {
                      setSelectedIds((prev) => prev.filter((id) => id !== subscriber.id))
                    }
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {subscriber.name || 'Unnamed'} ({subscriber.phone_number})
                </span>
              </label>
            ))}
            {subscribers.length === 0 && (
              <p className="text-xs text-gray-400">No active subscribers found.</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={isSending || !message.trim() || selectedCount === 0}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
      >
        <Send className="w-4 h-4" />
        {isSending ? 'Sending...' : `Send Broadcast (${selectedCount})`}
      </button>

      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex gap-2">
        <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-600 dark:text-blue-400">
          Broadcasts are sent with a 100ms delay between messages to reduce rate-limit risks.
        </p>
      </div>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Users className="w-4 h-4" />
          Recent Broadcasts
        </h3>
        <div className="space-y-2">
          {history.slice(0, 5).map((broadcast) => (
            <div
              key={broadcast.id}
              className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40"
            >
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{broadcast.message}</p>
              <div className="mt-1 text-xs text-gray-400 flex items-center justify-between">
                <span>{broadcast.successful}/{broadcast.total_recipients} sent</span>
                <span>{new Date(broadcast.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-xs text-gray-400">No broadcasts yet.</p>}
        </div>
      </div>
    </div>
  )
}
