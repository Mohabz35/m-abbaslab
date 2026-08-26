'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Users, Heart, Brain, Zap, Shield, Target, Trophy, ExternalLink, ChevronDown, ChevronUp, Send } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function AdvocacyPage() {
  const [expandedPillar, setExpandedPillar] = useState(0)
  const [selectedTitle, setSelectedTitle] = useState(0)

  const titles = personalConfig.fashionTitles || []
  const pillars = personalConfig.advocacyPillars || []
  const journey = personalConfig.leadershipJourney || []

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-20 pt-8">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <Heart className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
          Human <span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(251,146,60,0.3)]">Empowerment</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Building systems. Leading youth. Bridging equality. My journey from class prefect → school president → university leader → advocating for Kenya's 47 million youth.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
          <Zap className="w-4 h-4" />
          13 Modeling Titles • 6 Empowerment Pillars • Nationwide Impact
        </div>
      </motion.div>

      {/* MODELING TITLES SHOWCASE */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Trophy className="w-8 h-8 mr-4 text-amber-500" />
            13 Modeling Titles
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {titles.map((title, i) => (
            <motion.div
              key={title.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-amber-500/20 hover:border-amber-500/50 transition-all group cursor-pointer"
              onClick={() => setSelectedTitle(i)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">{title.title}</h3>
                  <span className="text-amber-400 text-sm font-semibold">{title.rank}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">{title.year}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{title.category}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{title.impact}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* LEADERSHIP TIMELINE */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-4 text-blue-500" />
            Leadership Journey
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="relative border-l-2 border-blue-500/30 ml-4 md:ml-10 space-y-12">
          {journey.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] border-4 border-black" />
              <div className="glass-panel p-6 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-blue-400 font-mono text-xs mb-2 block uppercase">{item.level}</span>
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">{item.school}</span>
                </div>
                <p className="text-gray-400 mb-3">{item.achievement}</p>
                {item.legacy && <p className="text-amber-400 text-sm font-semibold italic">Legacy: {item.legacy}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 6 EMPOWERMENT PILLARS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Heart className="w-8 h-8 mr-4 text-rose-500" />
            6 Empowerment Pillars
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="space-y-4">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.pillar}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setExpandedPillar(expandedPillar === i ? -1 : i)}
                className="w-full glass-panel p-6 rounded-2xl border border-rose-500/20 hover:border-rose-500/50 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition-colors">{pillar.pillar}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{pillar.description}</p>
                  </div>
                  <div className="ml-4">
                    {expandedPillar === i ? (
                      <ChevronUp className="w-5 h-5 text-rose-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {expandedPillar === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-panel mt-2 p-6 rounded-2xl border border-rose-500/20 border-t-0 rounded-t-none">
                      <p className="text-gray-300 mb-4">{pillar.description}</p>
                      {pillar.goal && <p className="text-amber-400 font-semibold mb-3">Goal: {pillar.goal}</p>}
                      {pillar.initiatives && pillar.initiatives.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-white font-semibold mb-2">Initiatives:</h4>
                          <ul className="space-y-2">
                            {pillar.initiatives.map((init) => (
                              <li key={init} className="text-gray-300 text-sm flex items-start">
                                <span className="text-rose-500 mr-2">▸</span>
                                {init}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {pillar.visited && pillar.visited.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Counties Visited:</h4>
                          <div className="flex flex-wrap gap-2">
                            {pillar.visited.map((county) => (
                              <span key={county} className="px-3 py-1 rounded-full text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                {county}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CALL TO ACTION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-12 rounded-3xl border border-gradient bg-gradient-to-br from-rose-500/10 to-amber-500/10 border-rose-500/20 text-center mb-24"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Movement</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          We're building a nation where youth are empowered, systems are equitable, and every voice matters. Let's change Kenya together.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/initiatives"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] transition-all"
          >
            Explore Initiatives
            <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
          <a
            href="mailto:hello@m-abbaslab.com"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            <Send className="w-4 h-4 mr-2" />
            Get in Touch
          </a>
        </div>
      </motion.div>
    </div>
  )
}