'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Send, Phone, Bot, RefreshCw, Smartphone } from 'lucide-react'

const JARVIS_ENGINE_URL = process.env.NEXT_PUBLIC_JARVIS_ENGINE_URL || 'http://localhost:3009'

export default function WhatsAppTestConsole() {
  const [messages, setMessages] = useState<{ id: string, text: string, isBot: boolean, time: string }[]>([
    { id: '1', text: 'JARVIS WhatsApp Sandbox — messages are sent via the engine.', isBot: true, time: new Date().toLocaleTimeString() }
  ])
  const [input, setInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [testPhone, setTestPhone] = useState('+254712345678')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const res = await fetch(`${JARVIS_ENGINE_URL}/health`, { signal: AbortSignal.timeout(5000) })
      setIsConnected(res.ok)
    } catch {
      setIsConnected(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !testPhone.trim()) return
    const newMsg = { id: Date.now().toString(), text: input, isBot: false, time: new Date().toLocaleTimeString() }
    setMessages(prev => [...prev, newMsg])
    setInput('')
    setSending(true)

    try {
      const res = await fetch(`${JARVIS_ENGINE_URL}/send-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: input }),
        signal: AbortSignal.timeout(10000)
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: res.ok ? `Sent to ${testPhone}: "${input}"` : `Failed: ${data.error || 'Unknown error'}`,
        isBot: true,
        time: new Date().toLocaleTimeString()
      }])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Connection error: ${err.message}. Engine may be offline.`,
        isBot: true,
        time: new Date().toLocaleTimeString()
      }])
    }
    setSending(false)
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white">JARVIS WhatsApp Engine</h3>
            <p className="text-xs text-slate-400">{isConnected ? 'Engine Connected' : 'Engine Offline'}</p>
          </div>
        </div>
        <button onClick={checkConnection} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> {isConnected ? 'Recheck' : 'Connect'}
        </button>
      </div>

      <div className="p-4 bg-slate-800/50 border-b border-slate-700 flex gap-4 items-center">
        <div className="flex-1 relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Recipient Phone (+254...)" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl p-3 ${msg.isBot ? 'bg-slate-800 border border-slate-700 text-white rounded-tl-none' : 'bg-emerald-600 text-white rounded-tr-none'}`}>
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.isBot ? 'text-slate-400' : 'text-emerald-200'} text-right`}>{msg.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-700 bg-slate-800">
        <div className="flex gap-2">
          <input type="text" placeholder="Type a message to send via JARVIS..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} disabled={sending} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50" />
          <button onClick={handleSend} disabled={sending || !input.trim() || !testPhone.trim()} className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-50">
            <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">Messages are sent via the JARVIS WhatsApp Engine at {JARVIS_ENGINE_URL}</p>
      </div>
    </div>
  )
}
