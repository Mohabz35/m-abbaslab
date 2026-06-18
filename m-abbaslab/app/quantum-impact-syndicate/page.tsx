'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import {
  ShieldAlert, Sparkles, Send, BrainCircuit, Globe,
  Terminal, ShieldCheck, TrendingUp, Cpu, Award,
  ArrowRight, Users, Briefcase, Zap, RefreshCw,
  FileText, Scale, DollarSign, Crown, Lock, Star,
  AlertTriangle, CheckCircle, ChevronDown, Gavel
} from 'lucide-react'

export default function QuantumImpactSyndicate() {
  const [invited, setInvited] = useState(false)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [accredited, setAccredited] = useState(false)
  const [ndaAgreed, setNdaAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  // Portal States
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginError, setLoginError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    })

    if (error) {
      setLoginError('Invalid email or password')
    } else {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !accredited || !ndaAgreed) return
    setLoading(true)
    setTimeout(() => { setInvited(true); setLoading(false) }, 1500)
  }

  const tiers = [
    {
      name: 'Associate Member',
      badge: 'Entry Level',
      color: 'blue',
      icon: Star,
      access: ['Read-only research access', 'Monthly syndicate briefings', 'Quarterly strategy digest'],
      conditions: 'Accredited individual or institutional researcher',
      profit: '5% profit-sharing on joint ventures',
    },
    {
      name: 'Core Syndicate Member',
      badge: 'Operational',
      color: 'purple',
      icon: Award,
      access: ['Full research collaboration', 'Alpha engine contributions', 'Project incubation rights', 'Voting rights on strategic decisions'],
      conditions: 'Demonstrated track record + NDA execution',
      profit: '15% profit-sharing on joint ventures',
    },
    {
      name: 'Leadership Appointee',
      badge: 'Executive',
      color: 'amber',
      icon: Crown,
      access: ['Division leadership authority', 'Budget allocation rights', 'Recruitment & onboarding sign-off', 'Direct access to Founder'],
      conditions: 'Invitation only — by Chief Strategist',
      profit: '25–40% profit-sharing per charter agreement',
    },
  ]

  const divisions = [
    { icon: TrendingUp, title: 'Quantitative Research Division', desc: 'High-frequency macro modeling, PEFM Engine alpha frameworks, and proprietary econometrics pipelines.' },
    { icon: Cpu, title: 'Applied AI Division', desc: 'Continuous learning agents, neural-symbolic models, and autonomous communication integrations for self-correcting systems.' },
    { icon: BrainCircuit, title: 'Venture Incubation Division', desc: 'Strategic acceleration for high-disruption ecosystems — coordinating SkillSync AI, ILMS, and beyond.' },
    { icon: Globe, title: 'Global Impact Division', desc: 'Community-facing programs, academic partnerships, and ESG-aligned syndicate projects across East Africa and beyond.' },
  ]

  const documents = [
    { icon: FileText, name: 'QIS Foundational Bundle', desc: 'The complete constitutional framework governing QIS operations, values, and membership standards.' },
    { icon: Gavel, name: 'QIS NDA Agreement', desc: 'Binding non-disclosure agreement required for all Core and Leadership tier members before access.' },
    { icon: DollarSign, name: 'QIS Profit Sharing Charter', desc: 'Transparent revenue distribution framework across all active members and venture projects.' },
    { icon: AlertTriangle, name: 'QIS Penalty & Reward Scheme', desc: 'Performance accountability framework with structured incentives for excellence and consequences for breaches.' },
    { icon: Users, name: 'QIS Membership Agreement', desc: 'Formal contractual terms for all syndicate members defining rights, responsibilities, and exit clauses.' },
    { icon: Crown, name: 'QIS Leadership Appointment Template', desc: 'Official governance document for designating division heads and executive collaborators.' },
  ]

  const faqs = [
    { q: 'Who can apply to QIS?', a: 'QIS welcomes researchers, economists, technologists, AI practitioners, fashion entrepreneurs, and venture builders who operate at the frontier of their discipline.' },
    { q: 'Is the NDA binding?', a: 'Yes. All Core Members and above must execute the QIS NDA before receiving access to proprietary research, alpha engines, or confidential syndicate operations.' },
    { q: 'How does profit sharing work?', a: 'Profit sharing is governed by the QIS Profit Sharing Charter. Percentages range from 5% (Associate) to 40% (Leadership) depending on tier, contribution level, and venture-specific agreements.' },
    { q: 'What is the Penalty & Reward Scheme?', a: 'Members who exceed KPIs receive accelerated profit tiers and recognition. Breaches of conduct, NDA violations, or chronic underperformance result in structured penalties up to membership revocation.' },
  ]

  return (
    <div className="min-h-screen bg-[#020108] text-white relative font-sans overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10 bg-[linear-gradient(to_right,#1d1a39_1px,transparent_1px),linear-gradient(to_bottom,#1d1a39_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative space-y-24">

        {/* Hero */}
        <div className="text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}
            className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-black border border-white/10 rounded-full flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.2)]">
            <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 border border-purple-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">Q</span>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Zap className="w-3 h-3" /> Official Launch Active
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-white to-indigo-400 bg-clip-text text-transparent uppercase">
            Quantum Impact Syndicate
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            An elite research collective and venture architecture firm founded by{' '}
            <span className="text-white font-semibold">Mohammed Abbas</span>. We merge Quantitative Econometrics, Deep Reinforcement Learning, and high-impact Venture Strategy to build systems that operate at the frontier.
          </motion.p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Asset Intelligence Index', val: '$140M+', desc: 'Allocated Micro-cap' },
            { label: 'System Precision', val: '94.2%', desc: 'Autonomous PEFM Signal' },
            { label: 'Proprietary Alpha Engines', val: '8 Active', desc: 'Live-engineered' },
            { label: 'Accreditation Standard', val: '100%', desc: 'High Professionalism Target' },
          ].map((stat, idx) => (
            <motion.div key={idx} initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 * idx }}
              className="p-6 border border-white/5 rounded-2xl bg-black/40 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="text-3xl md:text-4xl font-extrabold text-white font-mono">{stat.val}</div>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-2">{stat.label}</div>
              <div className="text-[10px] text-gray-500 mt-1">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Divisions */}
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-widest text-center text-white mb-12">Syndicate Operation Divisions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {divisions.map((div, idx) => {
              const Icon = div.icon
              return (
                <div key={idx} className="p-8 border border-white/10 rounded-3xl bg-black/40 hover:border-blue-500/30 transition-all duration-300 group relative">
                  <div className="absolute top-0 left-0 w-12 h-12 bg-blue-500/10 rounded-br-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-3">{div.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{div.desc}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Membership Tiers */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-3">Membership Structure</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">QIS operates on a tiered membership framework governed by the <span className="text-gray-300">QIS Membership Agreement Form</span> and <span className="text-gray-300">Leadership Appointment Template</span>.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier, idx) => {
              const Icon = tier.icon
              const colorMap: Record<string, string> = { blue: 'border-blue-500/40 bg-blue-500/5', purple: 'border-purple-500/40 bg-purple-500/5', amber: 'border-amber-500/40 bg-amber-500/5' }
              const textMap: Record<string, string> = { blue: 'text-blue-400', purple: 'text-purple-400', amber: 'text-amber-400' }
              return (
                <motion.div key={idx} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedTier(selectedTier === tier.name ? null : tier.name)}
                  className={`p-8 border rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedTier === tier.name ? colorMap[tier.color] : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
                  {tier.color === 'amber' && <div className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-[9px] font-bold text-amber-400 uppercase">Invite Only</div>}
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${colorMap[tier.color]}`}>
                    <Icon className={`w-5 h-5 ${textMap[tier.color]}`} />
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textMap[tier.color]}`}>{tier.badge}</div>
                  <h3 className="text-lg font-bold text-white mb-4">{tier.name}</h3>
                  <ul className="space-y-2 mb-5">
                    {tier.access.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                        <CheckCircle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${textMap[tier.color]}`} />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <div className={`text-xs font-bold ${textMap[tier.color]} border-t border-white/5 pt-4`}>{tier.profit}</div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Governance Documents */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold uppercase tracking-widest text-white mb-3">Governance & Legal Framework</h2>
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">QIS is governed by a comprehensive suite of founding documents. These are available to verified members following NDA execution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc, idx) => {
              const Icon = doc.icon
              return (
                <motion.div key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }}
                  className="flex gap-4 p-6 border border-white/8 rounded-2xl bg-black/30 hover:border-white/20 hover:bg-white/5 transition-all group">
                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/40 transition-all">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-white">{doc.name}</h4>
                      <Lock className="w-3 h-3 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{doc.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-center text-white mb-10">Common Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-white/10 rounded-2xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors">
                  <span className="text-sm font-semibold text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="px-5 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5">
                      <div className="pt-4">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* QIS Member Portal — Sign In / Sign Up */}
        <div className="max-w-2xl mx-auto border border-white/10 rounded-3xl bg-black/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* Portal Header */}
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
              <Lock className="w-3 h-3" /> QIS Member Portal
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-wide">Syndicate Access Gateway</h2>
            <p className="text-xs text-gray-500 mb-6">Existing members sign in. New applicants request association below.</p>

            {/* Tabs */}
            {!isAuthenticated && !invited && (
              <div className="flex rounded-xl border border-white/10 overflow-hidden mb-8">
                <button
                  onClick={() => setActiveTab('signin')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'signin'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'signup'
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Request Access
                </button>
              </div>
            )}
          </div>

          <div className="p-8 pt-0">
            <AnimatePresence mode="wait">

              {/* ===== AUTHENTICATED STATE ===== */}
              {isAuthenticated && (
                <motion.div key="authenticated" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 bg-blue-500/10 border-2 border-blue-500/40 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Access Granted</div>
                    <h3 className="text-xl font-bold text-white">Welcome, Chief Strategist</h3>
                    <p className="text-sm text-gray-400 mt-2">You have full syndicate access. Member administration panel coming soon.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                    <a href="/admin/dashboard" className="py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center transition-all">Admin Panel</a>
                    <button onClick={() => { setIsAuthenticated(false); setLoginEmail(''); setLoginPassword('') }}
                      className="py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 text-xs font-bold transition-all">
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ===== SIGN IN TAB ===== */}
              {!isAuthenticated && activeTab === 'signin' && (
                <motion.form key="signin" onSubmit={handleLogin} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="your@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                    <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
                  </div>
                  {loginError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {loginError}
                    </motion.div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4" /><span>Authenticate</span></>}
                  </button>
                  <p className="text-center text-xs text-gray-600">Not a member yet?{' '}
                    <button type="button" onClick={() => setActiveTab('signup')} className="text-blue-400 hover:text-blue-300 font-semibold">Request access →</button>
                  </p>
                </motion.form>
              )}

              {/* ===== SIGN UP / REQUEST ACCESS TAB ===== */}
              {!isAuthenticated && activeTab === 'signup' && !invited && (
                <motion.form key="signup" onSubmit={handleRequest} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Legal Name</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role / Discipline</label>
                      <input type="text" value={role} onChange={e => setRole(e.target.value)} required placeholder="e.g. Economist, AI Engineer"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Professional Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="entity@institution.domain"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-purple-500/50 transition-all" />
                  </div>
                  <div className="space-y-3 p-4 border border-white/5 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={accredited} onChange={e => setAccredited(e.target.checked)} required className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-white/5" />
                      <span className="text-xs text-gray-400">I represent a research institution, venture pool, or creative entity meeting QIS accreditation criteria.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={ndaAgreed} onChange={e => setNdaAgreed(e.target.checked)} required className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-white/5" />
                      <span className="text-xs text-gray-400">I understand that Core Member access requires execution of the <span className="text-gray-200 font-semibold">QIS NDA</span> and acceptance of the Penalty & Reward Scheme.</span>
                    </label>
                  </div>
                  <button type="submit" disabled={loading || !accredited || !ndaAgreed}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /><span>Transmit Association Request</span></>}
                  </button>
                  <p className="text-center text-xs text-gray-600">Already a member?{' '}
                    <button type="button" onClick={() => setActiveTab('signin')} className="text-blue-400 hover:text-blue-300 font-semibold">Sign in →</button>
                  </p>
                </motion.form>
              )}

              {/* ===== SUCCESS STATE ===== */}
              {!isAuthenticated && invited && (
                <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Request Transmitted</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                    Your credentials have been queued for review. Chief Strategist <span className="text-white font-semibold">Mohammed Abbas</span> will contact you with NDA documentation and next steps.
                  </p>
                  <a href="https://wa.me/254702894309" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold transition-all">
                    <Zap className="w-4 h-4" /> Direct Priority Contact via WhatsApp
                  </a>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  )
}
