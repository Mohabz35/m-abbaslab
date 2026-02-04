'use client'

import { Github, Linkedin, Twitter, Mail, Heart, Instagram, Facebook, Youtube, MessageCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { personalConfig } from '@/config/personal'
import { useMagneticHover } from '@/hooks/useMagneticHover'

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Work', href: '/work' },
  { name: 'Articles', href: '/articles' },
  { name: 'Fashion', href: '/fashion' },
  { name: 'Contact', href: '/contact' },
]

// Map social platforms to their Lucide icons
const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: MessageCircle, // Using placeholder for TikTok
  whatsapp: MessageCircle,
  telegram: Send,
}

function MagneticSocialIcon({
  href,
  label,
  icon: Icon
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const { position, handleMouseMove, handleMouseLeave } = useMagneticHover(0.25)

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00f0ff]/50 hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
      aria-label={label}
      title={label}
    >
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-[#00f0ff] group-hover:scale-110 transition-all duration-300" />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-[#00f0ff]/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
    </motion.a>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto border-t border-white/10 bg-black/40 backdrop-blur-md">
      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-50 animate-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#00f0ff] rounded-full animate-pulse" />
              <span className="text-2xl font-bold text-white tracking-tight">
                {personalConfig.brandName}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              {personalConfig.tagline}
            </p>
            <p className="text-xs text-gray-500">
              © {currentYear} {personalConfig.name}
              <br />
              All rights reserved.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <nav className="flex flex-col space-y-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group text-sm text-gray-400 hover:text-[#00f0ff] transition-colors duration-200 flex items-center"
                >
                  <span className="w-0 group-hover:w-4 h-px bg-[#00f0ff] transition-all duration-300 mr-0 group-hover:mr-2" />
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Social Media */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Connect
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(personalConfig.social).map(([platform, url]) => {
                const Icon = socialIconMap[platform]
                if (!Icon) return null

                return (
                  <MagneticSocialIcon
                    key={platform}
                    href={url}
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                    icon={Icon}
                  />
                )
              })}
            </div>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Contact
            </h3>
            <div className="space-y-3">
              <a
                href={`mailto:${personalConfig.email}`}
                className="flex items-center text-sm text-gray-400 hover:text-[#00f0ff] transition-colors duration-200 group"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                {personalConfig.email}
              </a>
              <div className="pt-4">
                <Link
                  href="/contact"
                  className="inline-block px-6 py-2 border border-[#00f0ff]/30 text-[#00f0ff] rounded-lg text-sm font-semibold hover:bg-[#00f0ff]/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
                >
                  Let's Connect
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-500">
            <div className="flex items-center">
              Crafted with <Heart className="w-4 h-4 mx-1 text-pink-500 fill-pink-500 animate-pulse" /> using Next.js & Framer Motion
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="hover:text-[#7000ff] transition-colors">
                Admin
              </Link>
              <span>•</span>
              <span>Version 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}