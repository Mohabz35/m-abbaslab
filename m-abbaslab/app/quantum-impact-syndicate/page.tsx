// app/quantum-impact-syndicate/page.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShieldAlert, Sparkles, Send, BrainCircuit, Globe, 
  Terminal, ShieldCheck, TrendingUp, Cpu, Award, 
  ArrowRight, Users, Briefcase, Zap, RefreshCw
} from 'lucide-react'
import { personalConfig } from '@/config/personal'

export default function QuantumImpactSyndicate() {
  const [invited, setInvited] = useState(false)
  const [email, setEmail] = useState('')
  const [accredited, setAccredited] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setInvited(true)
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#020108] text-white relative font-sans overflow-hidden">
      {/* Background Grid & Stars */}
      <div className="absolute inset-0 pointer-events-none opacity-20 -z-10 bg-[linear-gradient(to_right,#1d1a39_1px,transparent_1px),linear-gradient(to_bottom,#1d1a39_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Massive Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
        
        {/* Logo and Tagline Hero */}
        <div className="text-center mb-16 md:mb-24">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-28 h-28 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-black border border-white/10 rounded-full flex items-center justify-center relative shadow-[0_0_50px_rgba(59,130,246,0.2)]"
          >
            {/* Spinning atomic ring */}
            <div className="absolute inset-2 border-2 border-dashed border-blue-500/30 rounded-full animate-[spin_40s_linear_infinite]" />
            <div className="absolute inset-4 border border-purple-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            
            {/* Real Logo center representation */}
            <span className="text-4xl font-extrabold bg-gradient-to-r from-blue-400 via-white to-purple-400 bg-clip-text text-transparent">Q</span>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-white to-indigo-400 bg-clip-text text-transparent uppercase font-sans"
          >
            Quantum Impact Syndicate
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            An elite research collective and technological powerhouse founded by <span className="text-white font-semibold">Mohammed Abbas</span>. We merge Quantitative Econometrics, Deep Reinforcement Learning, and Venture Architecture.
          </motion.p>
        </div>

        {/* Live Performance Matrix Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
          {[
            { label: "Asset Intelligence Index", val: "$140M+", desc: "Allocated Micro-cap" },
            { label: "Reinforcement System Precision", val: "94.2%", desc: "Autonomous PEFM Signal" },
            { label: "Proprietary Alpha Engines", val: "8 Active", desc: "Live-engineered" },
            { label: "High Professionalism Target", val: "100%", desc: "Accredited Standard" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * idx, duration: 0.6 }}
              className="glass-panel p-6 border border-white/5 rounded-2xl bg-black/40 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="text-3xl md:text-4xl font-extrabold text-white font-mono">{stat.val}</div>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-2">{stat.label}</div>
              <div className="text-[10px] text-gray-500 mt-1">{stat.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Syndicate Core Divisions */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-center text-white mb-12">
            Syndicate Operation Divisions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Quantitative Research",
                desc: "High-frequency macro modeling, econometrics time-series pipelines, and custom alpha framework designs based on the proprietary PEFM Engine."
              },
              {
                icon: Cpu,
                title: "Applied Artificial Intelligence",
                desc: "Continuous learning agents, neural-symbolic models, and complete autonomous WhatsApp communications integrations for rapid system self-correction."
              },
              {
                icon: BrainCircuit,
                title: "Venture Incubation",
                desc: "Strategic acceleration and scale systems engineering for high-disruption ecosystems, coordinating projects like SkillSync AI and ILMS."
              }
            ].map((div, idx) => (
              <div key={idx} className="glass-panel p-8 border border-white/10 rounded-3xl bg-black/40 hover:border-blue-500/30 transition-all duration-300 group relative">
                <div className="absolute top-0 left-0 w-12 h-12 bg-blue-500/10 rounded-br-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-blue-400 group-hover:scale-110 transition-transform">
                    <div.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{div.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{div.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accredited Portal & Invitation Form */}
        <div className="max-w-2xl mx-auto glass-panel p-8 md:p-12 border border-white/10 rounded-3xl bg-black/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          <h2 className="text-2xl font-bold text-center text-white mb-2 uppercase tracking-wide">
            Request Syndicate Association
          </h2>
          <p className="text-xs text-gray-500 text-center uppercase tracking-widest mb-8">
            Access Restricted to Accredited Collaborators and Venture Entities
          </p>

          <AnimatePresence mode="wait">
            {!invited ? (
              <motion.form
                key="form"
                onSubmit={handleRequest}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Professional Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="entity@institution.domain"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="accredited"
                    checked={accredited}
                    onChange={(e) => setAccredited(e.target.checked)}
                    required
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/5 border-white/10"
                  />
                  <label htmlFor="accredited" className="text-xs text-gray-400 cursor-pointer">
                    I confirm that I represent a research institution, accredited venture pool, or creative entity.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !accredited}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Transmit Request</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6 space-y-4"
              >
                <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto text-blue-400">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Transmission Successful</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Your entry credentials have been queued. Chief Strategist <span className="text-white font-semibold">Mohammed Abbas</span> will contact your entity directly.
                </p>
                <a
                  href={`https://wa.me/254702894309`}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-xs font-bold transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Direct Priority Contact via WhatsApp
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  )
}
