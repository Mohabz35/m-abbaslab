// components/ContactForm.tsx
'use client'

import { useState } from 'react'
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMagneticHover } from '@/hooks/useMagneticHover'

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const { position, handleMouseMove, handleMouseLeave } = useMagneticHover(0.3)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    // Validate form
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields')
      setIsSubmitting(false)
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      // 1. Post to Web3Forms for email notification
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '76563071-941f-4a1a-ba58-8fa374fcf58a',
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'New Message from M-AbbasLab',
          message: formData.message,
        }),
      })

      const data = await response.json()

      // 2. Also save to Supabase for the Message Center dashboard
      const { supabase } = await import('@/lib/supabase')
      const { error: supabaseError } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject || '(No Subject)',
          message: formData.message,
          status: 'unread'
        }])

      if (supabaseError) {
        console.warn('Supabase storing failed, but Web3Forms might have succeeded:', supabaseError)
      }

      if (!data.success) {
        throw new Error(data.message || 'Failed to send message')
      }

      // Success!
      setIsSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl p-4 border border-[#00f0ff]/30 bg-[#00f0ff]/10 backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00f0ff]/20 to-transparent animate-pulse" />
            <div className="relative flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-[#00f0ff]" />
              <div>
                <h3 className="font-bold text-white">Message Sent!</h3>
                <p className="text-sm text-gray-300">
                  Thank you for your message. I'll get back to you soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="relative overflow-hidden rounded-xl p-4 border border-red-500/30 bg-red-500/10 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name & Email Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-300">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholder="John Doe"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder:text-gray-500 ${focusedField === 'name'
              ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-white/10 hover:border-white/20'
              }`}
            required
            disabled={isSubmitting}
          />
          {focusedField === 'name' && (
            <motion.div
              layoutId="focus-indicator"
              className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#00f0ff]/50 to-[#7000ff]/50 -z-10 blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        <div className="relative">
          <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-300">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="john@example.com"
            className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder:text-gray-500 ${focusedField === 'email'
              ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-white/10 hover:border-white/20'
              }`}
            required
            disabled={isSubmitting}
          />
          {focusedField === 'email' && (
            <motion.div
              layoutId="focus-indicator-email"
              className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#00f0ff]/50 to-[#7000ff]/50 -z-10 blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>
      </div>

      {/* Subject */}
      <div className="relative">
        <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-300">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          onFocus={() => setFocusedField('subject')}
          onBlur={() => setFocusedField(null)}
          className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white ${focusedField === 'subject'
            ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            : 'border-white/10 hover:border-white/20'
            }`}
          disabled={isSubmitting}
        >
          <option value="" className="bg-gray-900">Select a subject</option>
          <option value="collaboration" className="bg-gray-900">Project Collaboration</option>
          <option value="research" className="bg-gray-900">Research Inquiry</option>
          <option value="mentorship" className="bg-gray-900">Mentorship Request</option>
          <option value="freelance" className="bg-gray-900">Freelance Work</option>
          <option value="fashion" className="bg-gray-900">Fashion/Modeling</option>
          <option value="other" className="bg-gray-900">Other</option>
        </select>
      </div>

      {/* Message */}
      <div className="relative">
        <label htmlFor="message" className="block text-sm font-medium mb-2 text-gray-300">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          onFocus={() => setFocusedField('message')}
          onBlur={() => setFocusedField(null)}
          rows={6}
          placeholder="Tell me about your project, idea, or question..."
          className={`w-full px-4 py-3 rounded-lg bg-white/5 border transition-all duration-300 text-white placeholder:text-gray-500 resize-none ${focusedField === 'message'
            ? 'border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
            : 'border-white/10 hover:border-white/20'
            }`}
          required
          disabled={isSubmitting}
        />
        {focusedField === 'message' && (
          <motion.div
            layoutId="focus-indicator-message"
            className="absolute -inset-px rounded-lg bg-gradient-to-r from-[#00f0ff]/50 to-[#7000ff]/50 -z-10 blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </div>

      {/* Submit Button with Magnetic Effect */}
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative"
      >
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full group relative px-6 py-4 bg-transparent border border-[#00f0ff] text-[#00f0ff] rounded-lg font-bold uppercase tracking-widest hover:bg-[#00f0ff] hover:text-black hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700" />
          <span className="relative flex items-center gap-3">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Message
              </>
            )}
          </span>
        </button>
      </motion.div>

      {/* Privacy Note */}
      <p className="text-xs text-gray-500 text-center">
        Your information is secure. I'll only use it to respond to your message.
      </p>
    </form>
  )
}
