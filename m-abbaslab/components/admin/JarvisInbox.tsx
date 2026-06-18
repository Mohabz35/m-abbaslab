'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, hasSupabaseKeys } from '@/lib/supabase'
import { 
  MessageSquare, RefreshCw, CheckCircle, AlertTriangle,
  User, Bot, ExternalLink, Inbox, Search, WifiOff
} from 'lucide-react'

interface WhatsAppMessage {
  id: number
  sender_number: string
  sender_name: string
  message_text: string
  jarvis_reply: string
  timestamp: string
  is_read: boolean
}

export default function JarvisInbox() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterUnread, setFilterUnread] = useState(false)

  const fetchMessages = useCallback(async () => {
    if (!hasSupabaseKeys) {
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (!error && data) {
      setMessages(data)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchMessages()

    // Realtime subscription — new messages appear instantly
    if (!hasSupabaseKeys) return

    const channel = supabase
      .channel('whatsapp-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
        (payload) => {
          setMessages(prev => [payload.new as WhatsAppMessage, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchMessages])

  const markAsRead = async (id: number) => {
    await supabase.from('whatsapp_messages').update({ is_read: true }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m))
  }

  const filtered = messages
    .filter(m => !filterUnread || !m.is_read)
    .filter(m =>
      !searchQuery ||
      m.sender_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message_text?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            JARVIS WhatsApp Inbox
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {unreadCount > 0
              ? <span className="text-green-500 font-bold">{unreadCount} unread messages</span>
              : 'All messages read'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!hasSupabaseKeys && (
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold rounded-md flex items-center gap-1">
              <WifiOff className="w-3 h-3" /> Supabase Not Connected
            </div>
          )}
          <button
            onClick={() => { setIsLoading(true); fetchMessages() }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-green-500/50"
          />
        </div>
        <button
          onClick={() => setFilterUnread(v => !v)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${filterUnread ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
        >
          Unread Only
        </button>
      </div>

      {/* Messages List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[600px] overflow-y-auto">
        {!hasSupabaseKeys ? (
          <div className="p-12 text-center text-gray-400">
            <WifiOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">Supabase Not Connected</p>
            <p className="text-xs mt-1 max-w-xs mx-auto">Add your Supabase keys to .env.local to see messages from the JARVIS WhatsApp bot here in real-time.</p>
          </div>
        ) : isLoading ? (
          <div className="p-12 flex justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-green-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the JARVIS engine and messages will appear here in real-time.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!msg.is_read ? 'bg-green-50/50 dark:bg-green-500/5 border-l-2 border-green-500' : ''}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{msg.sender_name || 'Unknown'}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{msg.sender_number?.split('@')[0]}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 truncate">{msg.message_text}</p>
                      {msg.jarvis_reply && (
                        <div className="flex items-start gap-1.5 mt-1.5">
                          <Bot className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-400 italic line-clamp-1">{msg.jarvis_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                    {!msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className="text-[10px] text-green-600 hover:text-green-500 font-bold flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle className="w-3 h-3" /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
