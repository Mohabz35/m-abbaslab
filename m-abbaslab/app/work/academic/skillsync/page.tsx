'use client'

import { motion } from 'framer-motion'
import { Book, ChevronRight, Sparkles, Brain, Cpu, LineChart, Zap, Layers } from 'lucide-react'
import Link from 'next/link'

const chapters = [
    { id: 'chapter-1', title: 'Academic Analysis & Validation', icon: Book, color: 'text-blue-400', desc: 'The scientific foundations of the SkillSync framework.' },
    { id: 'chapter-2', title: 'Mathematical Models & Equations', icon: LineChart, color: 'text-purple-400', desc: 'Modeling Growth, Decay, and Synergy in Skill DNA.' },
    { id: 'chapter-3', title: 'System Documentation & Architecture', icon: Cpu, color: 'text-cyan-400', desc: 'Full application structure and user journey flow.' },
    { id: 'chapter-4', title: 'The Evolution Engine (Prompt Guide)', icon: Zap, color: 'text-amber-400', desc: 'The definitive prompt architecture for SkillSync AI.' },
]

export default function SkillSyncDocsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#7000ff]/10 border border-[#7000ff]/20">
                    <Brain className="w-8 h-8 text-[#7000ff]" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                    SkillSync <span className="bg-gradient-to-r from-[#7000ff] to-[#00f0ff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(112,0,255,0.3)]">Intelligence</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    The next paradigm in human capital development. Explore the research, mathematics, and architecture behind the SkillSync evolution engine.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {chapters.map((chapter, index) => {
                    const Icon = chapter.icon
                    return (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link
                                href={`/work/academic/skillsync/${chapter.id}`}
                                className="group p-8 glass-panel rounded-3xl border border-white/5 hover:border-[#7000ff]/30 transition-all duration-300 flex items-start space-x-6 h-full relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/5 blur-3xl -z-10 group-hover:bg-[#7000ff]/10 transition-colors" />
                                <div className={`p-4 rounded-2xl bg-white/5 transition-colors group-hover:bg-white/10 ${chapter.color}`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">Chapter {index + 1}</div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-[#7000ff] transition-colors mb-3">
                                        {chapter.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        {chapter.desc}
                                    </p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-600 group-hover:text-[#7000ff] group-hover:translate-x-1 transition-all self-center" />
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {/* Vision Deck CTA */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="mt-20 p-10 md:p-16 rounded-[40px] glass-panel border border-[#7000ff]/20 text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#7000ff]/10 via-transparent to-[#00f0ff]/10" />
                <div className="relative z-10 flex flex-col items-center">
                    <Layers className="w-16 h-16 text-[#7000ff] mb-8 animate-pulse" />
                    <h2 className="text-4xl font-bold mb-6 text-white italic">"Engineering Human Evolution"</h2>
                    <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                        SkillSync treats skills as living entities. We are not just building a learning management system; we are mapping the future genome of professional growth.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/work/academic/skillsync/chapter-4"
                            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#7000ff] to-[#00f0ff] rounded-2xl text-white font-bold hover:shadow-[0_0_30px_rgba(112,0,255,0.4)] transition-all transform hover:-translate-y-1"
                        >
                            View The Evolution Engine <Sparkles className="ml-2 w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
