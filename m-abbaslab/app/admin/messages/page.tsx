'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Trash2, CheckCircle, Clock, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Message {
    id: string
    created_at: string
    name: string
    email: string
    subject: string
    message: string
    status: 'unread' | 'read' | 'archived'
}

export default function MessageCenter() {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

    const fetchMessages = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setMessages(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ status: 'read' })
                .eq('id', id)

            if (error) throw error
            setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m))
            if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status: 'read' })
        } catch (err) {
            console.error('Error marking as read:', err)
        }
    }

    const deleteMessage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id)

            if (error) throw error
            setMessages(messages.filter(m => m.id !== id))
            if (selectedMessage?.id === id) setSelectedMessage(null)
        } catch (err) {
            console.error('Error deleting message:', err)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono">
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider uppercase">Message Center</h1>
                            <p className="text-gray-500 text-sm">Intercepted communications and inquiries.</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchMessages}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </header>

                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center text-red-400">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        <p>Error: {error}. Make sure your Supabase environment variables are set and the schema is deployed.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Message List */}
                    <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        {loading && messages.length === 0 ? (
                            <div className="text-center py-20 text-gray-600">Initializing connection...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-20 text-gray-600">No messages found in database.</div>
                        ) : (
                            messages.map((m) => (
                                <motion.div
                                    key={m.id}
                                    layoutId={m.id}
                                    onClick={() => {
                                        setSelectedMessage(m)
                                        if (m.status === 'unread') markAsRead(m.id)
                                    }}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedMessage?.id === m.id
                                            ? 'bg-blue-500/10 border-blue-500/50'
                                            : m.status === 'unread'
                                                ? 'bg-white/5 border-white/20'
                                                : 'bg-black border-white/5 opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase ${m.status === 'unread' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {m.status}
                                        </span>
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(m.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-bold truncate">{m.subject || '(No Subject)'}</h3>
                                    <p className="text-xs text-gray-400 truncate mt-1">From: {m.name}</p>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Message Content */}
                    <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {selectedMessage ? (
                                <motion.div
                                    key={selectedMessage.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-start border-b border-white/10 pb-6">
                                        <div>
                                            <h2 className="text-2xl font-bold mb-2">{selectedMessage.subject || '(No Subject)'}</h2>
                                            <div className="space-y-1">
                                                <p className="text-sm text-blue-400">{selectedMessage.name}</p>
                                                <p className="text-xs text-gray-500">{selectedMessage.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => deleteMessage(selectedMessage.id)}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="py-6 min-h-[200px] text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </div>

                                    <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-gray-600">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-2" />
                                            SUBMITTED: {new Date(selectedMessage.created_at).toLocaleString()}
                                        </div>
                                        {selectedMessage.status === 'unread' && (
                                            <span className="flex items-center text-red-400">
                                                <AlertCircle className="w-4 h-4 mr-1" />
                                                REQUIRES ATTENTION
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 text-center">
                                    <Mail className="w-16 h-16 opacity-20" />
                                    <p>Select a transmission to view its contents.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 10px;
        }
      `}</style>
        </div>
    )
}
