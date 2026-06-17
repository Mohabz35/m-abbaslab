'use client'

import { useState } from 'react'
import { personalConfig } from '@/config/personal'
import {
  Mail, Github, Linkedin, Twitter, Instagram, Facebook,
  MessageSquare, Send, MapPin, Clock, Zap, Music,
  Calendar, Shield, Star, ChevronDown, ChevronUp,
  BookOpen, Code, Shirt, BarChart3, Mic, Briefcase,
  CheckCircle, ArrowRight, Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ContactForm from '@/components/ContactForm'

const bookingTypes = [
  {
    title: 'Quick Chat',
    duration: '15 min',
    price: 'Free',
    priceValue: 0,
    color: 'blue',
    icon: MessageSquare,
    description: 'Quick questions, introductions, or exploring fit',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500/60',
    bgGradient: 'from-blue-500/10 to-transparent',
    buttonBg: 'bg-blue-600 hover:bg-blue-500',
  },
  {
    title: 'Project Discussion',
    duration: '30 min',
    price: '$50',
    priceValue: 50,
    color: 'purple',
    icon: Briefcase,
    description: 'Deep-dive into project scope, timeline, and budget',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500/60',
    bgGradient: 'from-purple-500/10 to-transparent',
    buttonBg: 'bg-purple-600 hover:bg-purple-500',
    popular: true,
  },
  {
    title: 'Consulting Session',
    duration: '60 min',
    price: '$150',
    priceValue: 150,
    color: 'emerald',
    icon: BarChart3,
    description: 'Strategy, architecture review, or technical consulting',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500/60',
    bgGradient: 'from-emerald-500/10 to-transparent',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-500',
  },
]

const inquiryTabs = [
  { id: 'project', label: 'Project', icon: Code },
  { id: 'research', label: 'Research', icon: BookOpen },
  { id: 'mentorship', label: 'Mentorship', icon: Star },
  { id: 'freelance', label: 'Freelance', icon: Briefcase },
  { id: 'fashion', label: 'Fashion', icon: Shirt },
  { id: 'speaking', label: 'Speaking', icon: Mic },
]

const testimonials = [
  {
    name: 'Dr. Sarah Kimani',
    role: 'Research Lead, Strathmore University',
    text: 'Mohammed brought exceptional analytical rigor to our joint research on mobile money adoption. His data science skills are top-tier.',
    rating: 5,
  },
  {
    name: 'James Ochieng',
    role: 'CTO, TechStart Africa',
    text: 'Delivered a full-stack platform under a tight deadline. His hackathon experience shows in how quickly he ships quality code.',
    rating: 5,
  },
  {
    name: 'Amina Hassan',
    role: 'Fashion Director, Nairobi Fashion Week',
    text: 'His fashion-tech portfolio bridged technology and design in ways we had not seen before. Truly innovative approach.',
    rating: 5,
  },
]

const faqs = [
  {
    q: "What's the best way to contact you?",
    a: "Email is best for formal inquiries and project proposals. WhatsApp is great for quick questions during business hours (9 AM - 6 PM EAT). For structured discussions, book a call using the calendar above.",
  },
  {
    q: "Are you available for freelance work?",
    a: "I am selective about freelance projects. I prefer long-term collaborations over one-off gigs. Use the Project Discussion booking to discuss scope and fit.",
  },
  {
    q: "What is your typical project timeline?",
    a: "Depends on scope. Small features: 1-2 weeks. Full-stack apps: 1-3 months. Research projects: 2-6 months. I provide detailed timelines after our initial discussion.",
  },
  {
    q: "Do you work with startups?",
    a: "Absolutely. I have experience building MVPs and scaling products from zero. I am especially interested in fintech, edtech, and fashion-tech startups.",
  },
  {
    q: "What is your tech stack?",
    a: "Primary: Next.js, React, TypeScript, Supabase, PostgreSQL. Also experienced with Python, Django, Node.js, and ML frameworks. I choose the stack that fits the project.",
  },
  {
    q: "Can you work on retainer?",
    a: "Yes. Monthly retainers are available for ongoing development, consulting, or research support. Contact me to discuss terms.",
  },
  {
    q: "Do you offer equity deals?",
    a: "For the right early-stage startup, I am open to equity-based compensation alongside or instead of cash. Let's discuss during a Project Discussion call.",
  },
  {
    q: "Can you sign NDAs?",
    a: "Yes. I routinely sign NDAs for sensitive projects and research collaborations. This is standard practice for my QIS work.",
  },
  {
    q: "Do you do pro bono work?",
    a: "I occasionally take on pro bono projects for social impact, especially in education and community development. Reach out with details.",
  },
  {
    q: "What is your response time?",
    a: "Email: within 24 hours. WhatsApp: within 2 hours during business hours. Booked calls: confirmed within 1 hour. Mark urgent messages for 4-hour priority response.",
  },
]

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('project')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: personalConfig.social.github },
    { name: 'LinkedIn', icon: Linkedin, url: personalConfig.social.linkedin },
    { name: 'Twitter', icon: Twitter, url: personalConfig.social.twitter },
    { name: 'Instagram', icon: Instagram, url: personalConfig.social.instagram },
    { name: 'TikTok', icon: Music, url: personalConfig.social.tiktok },
    { name: 'Facebook', icon: Facebook, url: personalConfig.social.facebook },
  ]

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setSubscribed(true)
      setNewsletterEmail('')
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7000ff]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">

        {/* ═══════════════ HERO SECTION ═══════════════ */}
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
            Let's Build Something Great
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Whether you're interested in collaboration, have questions about my work, or just want to connect, I'd love to hear from you.
          </p>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {[
              { icon: Clock, text: 'Responds within 24 hours', color: 'text-[#00f0ff]' },
              { icon: Star, text: '4.9/5 rating', color: 'text-amber-400' },
              { icon: Shield, text: '100% confidential', color: 'text-emerald-400' },
              { icon: CheckCircle, text: '98% response rate', color: 'text-purple-400' },
            ].map((badge, idx) => {
              const Icon = badge.icon
              return (
                <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <Icon className={`w-3.5 h-3.5 ${badge.color}`} />
                  <span className="text-gray-400 text-xs">{badge.text}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ BOOKING SECTION ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Schedule a Call</h2>
            <p className="text-gray-400">Choose the format that fits your needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bookingTypes.map((booking, idx) => {
              const Icon = booking.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className={`relative p-8 rounded-2xl border ${booking.borderColor} ${booking.hoverBorder} bg-gradient-to-br ${booking.bgGradient} transition-all duration-300`}
                >
                  {booking.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className={`w-12 h-12 rounded-xl bg-${booking.color}-500/10 border border-${booking.color}-500/20 flex items-center justify-center mb-5`}>
                    <Icon className={`w-5 h-5 text-${booking.color}-400`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{booking.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{booking.description}</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-3xl font-bold text-white">{booking.price}</span>
                    <span className="text-sm text-gray-500">/ {booking.duration}</span>
                  </div>
                  <button className={`w-full py-3 ${booking.buttonBg} text-white rounded-xl font-bold text-sm transition-all`}>
                    Book Now
                  </button>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ MAIN CONTENT GRID ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">

          {/* Left Column: Contact Info */}
          <div className="space-y-6">
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
                Response within 24 hours
              </p>
            </motion.div>

            {/* WhatsApp Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-green-500/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">WhatsApp</h3>
                  <p className="text-gray-400">Immediate response / AI-Assistant</p>
                </div>
              </div>
              <a
                href={personalConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all duration-300"
              >
                <MessageSquare className="w-4 h-4" />
                Send WhatsApp DM
              </a>
              <p className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500 animate-pulse" />
                Online Now — AI-Autonomous reply
              </p>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
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
              transition={{ duration: 0.6, delay: 0.35 }}
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
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 animate-pulse" />
                  <span className="text-gray-300">Timezone: <span className="text-white font-medium">EAT (UTC+3)</span></span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Right Column: Segmented Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-panel rounded-2xl p-8 border border-white/10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white">Send a Message</h3>
                  <p className="text-gray-400">Choose your inquiry type below</p>
                </div>
              </div>

              {/* Inquiry Type Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {inquiryTabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff]'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Inquiry Type Description */}
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-xs text-gray-400">
                  {activeTab === 'project' && '💡 Describe your project, goals, and timeline. I typically respond within 24 hours with initial thoughts.'}
                  {activeTab === 'research' && '🔬 Share your research topic, methodology, and collaboration goals. Academic and industry research welcome.'}
                  {activeTab === 'mentorship' && '🎓 Tell me about your current stage, what you want to learn, and your availability. Limited slots available.'}
                  {activeTab === 'freelance' && '💼 Include project scope, budget range, and deadline. I prefer projects with clear requirements.'}
                  {activeTab === 'fashion' && '👗 Share your vision, event details, and portfolio links. Fashion-tech and modeling inquiries welcome.'}
                  {activeTab === 'speaking' && '🎤 Include event name, date, audience size, and topic. Virtual and in-person speaking available.'}
                </p>
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
                    'Mentorship',
                    'Hackathons',
                    'Speaking Engagements',
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

        {/* ═══════════════ TESTIMONIALS ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-white">What People Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                className="p-6 rounded-2xl border border-white/10 bg-black/30 hover:border-[#00f0ff]/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{t.name}</div>
                    <div className="text-[10px] text-gray-500">{t.role}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════ LEAD MAGNET / NEWSLETTER ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20 p-8 md:p-12 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-transparent to-[#00f0ff]/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Free Resources</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Get Free Guides & Insights</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Join 500+ subscribers receiving weekly insights on economics, AI, data science, and tech. Plus get exclusive free guides:
              </p>
              <div className="flex flex-wrap gap-2">
                {['10 Economics Concepts', 'AI Cheat Sheet', 'Hackathon Strategy', 'Fashion Tech Guide'].map((g) => (
                  <span key={g} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                    📘 {g}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full md:w-auto">
              {subscribed ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 font-semibold">You're subscribed!</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="px-5 py-3 rounded-xl bg-black/30 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none text-white placeholder-gray-600 w-full"
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Get Free Guide <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-gray-600 text-center">No spam, unsubscribe anytime</p>
                </form>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════ EXPANDED FAQ ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                className="glass-panel rounded-xl border border-white/10 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white text-sm pr-4">{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#00f0ff]/5 via-transparent to-[#7000ff]/5"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Pick a time above, send an email, or reach out on WhatsApp. I typically respond within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${personalConfig.email}`}
              className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all"
            >
              Send Email
            </a>
            <a
              href={personalConfig.social.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-xl hover:bg-green-500/20 transition-all"
            >
              WhatsApp Now
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
