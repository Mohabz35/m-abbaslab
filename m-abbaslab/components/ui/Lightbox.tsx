'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Award } from 'lucide-react'
import Image from 'next/image'

type LightboxItem = {
  id: string
  title: string
  description?: string
  category?: string
  image: string
  location?: string
  eventDate?: string
  achievement?: string
}

export default function Lightbox({
  items,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}: {
  items: LightboxItem[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
}) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < items.length - 1) onNavigate(currentIndex + 1)
    },
    [isOpen, currentIndex, items.length, onClose, onNavigate]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown, isOpen])

  if (!isOpen || !items[currentIndex]) return null
  const item = items[currentIndex]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-[10001] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
            className="absolute left-4 z-[10001] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < items.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
            className="absolute right-4 z-[10001] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <motion.div
          key={item.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-5xl w-full mx-4 flex flex-col lg:flex-row gap-0 rounded-3xl overflow-hidden bg-gray-900 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full lg:w-2/3 h-[400px] lg:h-[600px] bg-black">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
          <div className="w-full lg:w-1/3 p-6 lg:p-8 flex flex-col justify-between">
            <div>
              {item.category && (
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-pink-500/20 text-pink-400 border border-pink-500/30 mb-4">
                  {item.category}
                </span>
              )}
              <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
              {item.description && (
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{item.description}</p>
              )}
              {item.achievement && (
                <div className="flex items-center gap-2 text-amber-400 mb-3">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-semibold">{item.achievement}</span>
                </div>
              )}
              {item.location && (
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{item.location}</span>
                </div>
              )}
              {item.eventDate && (
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{item.eventDate}</span>
                </div>
              )}
            </div>
            <div className="text-gray-600 text-xs mt-4">
              {currentIndex + 1} / {items.length}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
