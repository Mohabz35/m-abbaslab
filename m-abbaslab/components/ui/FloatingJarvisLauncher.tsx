'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bot, MessageCircle } from 'lucide-react'
import JarvisChat from '@/components/ui/JarvisChat'

const HAS_INTERACTED_KEY = 'jarvis_launcher_interacted_v1'

export default function FloatingJarvisLauncher() {
  const [isMounted, setIsMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(true)

  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = window.localStorage.getItem(HAS_INTERACTED_KEY)
      setHasInteracted(stored === '1')
    } catch {
      setHasInteracted(true)
    }
  }, [])

  const markInteracted = () => {
    setHasInteracted(true)
    try {
      window.localStorage.setItem(HAS_INTERACTED_KEY, '1')
    } catch {
      // ignore storage failures
    }
  }

  const openChat = () => {
    markInteracted()
    setIsOpen(true)
  }

  if (!isMounted) return null

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[120] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-auto mb-3 w-[min(92vw,420px)] h-[min(78vh,620px)] relative"
          >
            <JarvisChat isActive={isOpen} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          onClick={openChat}
          className="pointer-events-auto relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-white shadow-[0_0_25px_rgba(0,212,255,0.35)] border border-white/30 flex items-center justify-center"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open Jarvis assistant"
        >
          {!hasInteracted && (
            <span className="absolute inset-0 rounded-full border border-[#00d4ff]/60 animate-ping" />
          )}
          <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
        </motion.button>
      )}

      {!isOpen && !hasInteracted && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none mt-2 px-3 py-1.5 rounded-full bg-black/70 border border-cyan-400/30 text-[11px] text-cyan-200 backdrop-blur text-center"
        >
          <span className="inline-flex items-center gap-1.5">
            <MessageCircle className="w-3 h-3" />
            Ask Jarvis
          </span>
        </motion.div>
      )}
    </div>
  )
}
