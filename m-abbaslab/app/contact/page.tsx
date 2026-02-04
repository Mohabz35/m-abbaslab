// app/contact/page.tsx
'use client'

import type { Metadata } from 'next'
import { personalConfig } from '@/config/personal'
import {
  Mail,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  MessageSquare,
  Send,
  MapPin,
  Clock,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  const socialLinks = [
    { name: 'GitHub', icon: Github, url: personalConfig.social.github },
    { name: 'LinkedIn', icon: Linkedin, url: personalConfig.social.linkedin },
    { name: 'Twitter', icon: Twitter, url: personalConfig.social.twitter },
    { name: 'Instagram', icon: Instagram, url: personalConfig.social.instagram },
    { name: 'Facebook', icon: Facebook, url: personalConfig.social.facebook },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7000ff]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 mb-6">
            <Zap className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#00f0ff] font-medium">Let's Connect</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#00f0ff] via-white to-[#7000ff] bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you're interested in collaboration, have questions about my work, or just want to connect, I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Contact Info */}
          <div className="space-y-6">
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-[#00f0ff]/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00f0ff] to-[#7000ff] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Email</h3>
                  <p className="text-gray-400">Primary contact method</p>
                </div>
              </div>

              <a
                href={`mailto:${personalConfig.email}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-[#00f0ff] rounded-lg hover:bg-white/10 hover:border-[#00f0ff]/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] transition-all duration-300"
              >
                <Mail className="w-4 h-4" />
                {personalConfig.email}
              </a>

              <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Typically responds within 24 hours
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-[#7000ff]/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#7000ff] to-pink-500 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Social Links</h3>
                  <p className="text-gray-400">Connect with me online</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#00f0ff]/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all duration-300 group"
                  >
                    <social.icon className="w-6 h-6 mb-2 text-gray-400 group-hover:text-[#00f0ff] group-hover:scale-110 transition-all duration-300" />
                    <span className="text-sm font-medium text-gray-300">{social.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-panel rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-white/5 to-transparent"
            >
              <h3 className="font-bold text-xl mb-6 text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00f0ff]" />
                Quick Info
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#00f0ff] rounded-full mt-2 animate-pulse" />
                  <span className="text-gray-300">Based in: <span className="text-white font-medium">Chuka University, Kenya</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 animate-pulse" />
                  <span className="text-gray-300">Status: <span className="text-white font-medium">Available for collaborations</span></span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#7000ff] rounded-full mt-2 animate-pulse" />
                  <span className="text-gray-300">Focus: <span className="text-white font-medium">Tech × Fashion × Data Science</span></span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-panel rounded-2xl p-8 border border-white/10 h-full">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Send a Message</h3>
                  <p className="text-gray-400">Fill out the form below</p>
                </div>
              </div>

              <ContactForm />

              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="font-medium mb-4 text-white">What I'm Interested In:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Research Collaborations',
                    'Tech Projects',
                    'Fashion Technology',
                    'Data Analysis',
                    'Academic Discussions',
                    'Mentorship'
                  ].map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] rounded-full text-sm hover:bg-[#00f0ff]/20 transition-colors duration-300"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                q: "What's the best way to contact you?",
                a: "Email is best for formal inquiries. For quick questions, Twitter DMs are also fine."
              },
              {
                q: "Are you available for freelance work?",
                a: "I'm selective about freelance projects. I prefer long-term collaborations over one-off gigs."
              },
              {
                q: "Can I use your projects as inspiration?",
                a: "Absolutely! All my public projects are open for learning and inspiration."
              },
              {
                q: "Do you offer mentorship?",
                a: "I occasionally mentor students in tech and data science. Feel free to reach out."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="glass-panel rounded-xl p-6 border border-white/10 hover:border-[#00f0ff]/30 transition-all duration-300 group"
              >
                <h3 className="font-bold text-lg mb-3 text-white group-hover:text-[#00f0ff] transition-colors">{faq.q}</h3>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
