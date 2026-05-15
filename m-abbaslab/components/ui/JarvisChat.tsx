'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Volume2, VolumeX, X, Terminal } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function JarvisChat({
  isActive,
  onClose
}: {
  isActive: boolean
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Greetings. I am M-Abbas AI — the personal intelligence of Mohammed Abbas. I can tell you about his work, projects, ventures, expertise, and vision. How can I assist you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  // Initialize SpeechSynthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  // Focus textarea when active
  useEffect(() => {
    if (isActive && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 500)
    } else {
      // Stop speaking if closed
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [isActive])

  const speak = (text: string) => {
    if (!isVoiceEnabled || !synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Try to find a good voice
    const voices = synthRef.current.getVoices()
    // Preference: English, ideally male or a clear voice.
    const preferredVoice = 
      voices.find(v => v.name.includes('Google UK English Male')) ||
      voices.find(v => v.name.includes('Microsoft Mark')) ||
      voices.find(v => v.lang === 'en-GB') ||
      voices.find(v => v.lang === 'en-US')
      
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.pitch = 0.9 // Slightly robotic/deep
    utterance.rate = 1.05
    
    synthRef.current.speak(utterance)
  }

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
    if (isVoiceEnabled && synthRef.current) {
      synthRef.current.cancel()
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px'
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/jarvis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      const data = await response.json()
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
        if (isVoiceEnabled) {
          speak(data.reply)
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Signal lost. Please try again." }])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection interrupted. System offline." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = '42px'
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
  }

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-xl border border-[#00d4ff]/30 rounded-[1.5rem] overflow-hidden"
    >
      {/* Scan Line Effect */}
      <div className="absolute inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50 animate-scan pointer-events-none z-0" />
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00d4ff] z-10" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00d4ff] z-10" />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#00d4ff]/20 bg-[#00d4ff]/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-[radial-gradient(circle_at_35%_35%,#00d4ff,#0055cc_60%,#000033)] shadow-[0_0_12px_rgba(0,212,255,0.4)] animate-pulse flex items-center justify-center">
            <Terminal className="w-4 h-4 text-white opacity-80" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-[#00d4ff] tracking-widest leading-none">M-ABBAS AI</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
              <span className="text-[10px] text-[#00d4ff]/60 tracking-wider">SYSTEM ONLINE · JARVIS v1.0</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleVoice}
            className={`p-1.5 rounded border transition-colors ${isVoiceEnabled ? 'border-[#00d4ff] text-[#00d4ff] bg-[#00d4ff]/10' : 'border-white/10 text-white/40 hover:text-white/80'}`}
            title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
          >
            {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded border border-[#00d4ff]/20 text-[#00d4ff]/60 hover:text-[#00d4ff] hover:border-[#00d4ff] transition-all"
            title="Close Terminal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative z-10 flex flex-col">
        <div className="text-center">
          <span className="font-mono text-[10px] text-[#00d4ff]/40 tracking-wider">// INITIALISING PERSONAL OPERATING SYSTEM //</span>
        </div>
        
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="font-mono text-[9px] text-[#00d4ff] mb-1 opacity-80 tracking-widest ml-1">M-ABBAS AI</span>
              )}
              <div 
                className={`p-3 rounded-lg text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#0066ff]/10 border border-[#0066ff]/30 text-[#a0b8cc] rounded-tr-sm' 
                    : 'bg-[#00d4ff]/5 border border-[#00d4ff]/20 text-[#c8d8e8] rounded-tl-sm shadow-[0_0_15px_rgba(0,212,255,0.05)]'
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="self-start max-w-[85%]"
            >
              <span className="font-mono text-[9px] text-[#00d4ff] mb-1 opacity-80 tracking-widest ml-1">M-ABBAS AI</span>
              <div className="p-3 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-lg rounded-tl-sm flex gap-1 items-center h-[42px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 border-t border-[#00d4ff]/20 bg-black/40 relative z-10">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about Mohammed..."
            className="flex-1 bg-[#00d4ff]/5 border border-[#00d4ff]/20 rounded-md p-2.5 text-sm text-[#c8d8e8] placeholder:text-[#00d4ff]/30 focus:outline-none focus:border-[#00d4ff]/50 resize-none min-h-[42px] max-h-[100px] font-sans"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-[42px] h-[42px] flex-shrink-0 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-md flex items-center justify-center text-[#00d4ff] hover:bg-[#00d4ff]/20 hover:border-[#00d4ff] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        <div className="text-[10px] text-center text-[#00d4ff]/40 mt-2 font-mono tracking-wider">
          ENTER TO SEND · SHIFT+ENTER FOR NEW LINE
        </div>
      </div>

    </motion.div>
  )
}
