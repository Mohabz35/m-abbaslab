'use client'

import { motion } from 'framer-motion'
import { Book, ChevronRight, LineChart, TrendingUp, Globe, Database, ShieldCheck, Terminal, Layers } from 'lucide-react'
import Link from 'next/link'

const chapters = [
    { id: 'chapter-1', title: 'Introduction & Background', icon: Book, color: 'text-blue-400', desc: 'The evolution from traditional econometrics to machine learning.' },
    { id: 'chapter-2', title: 'System Overview & Architecture', icon: Globe, color: 'text-emerald-400', desc: 'A modular, cloud-native approach to forecasting.' },
    { id: 'chapter-3', title: 'Data Pipeline Implementation', icon: Database, color: 'text-purple-400', desc: 'Ensuring data quality and pipeline symmetry.' },
    { id: 'chapter-4', title: 'ML Model Design (LSTM/GRU)', icon: Terminal, color: 'text-cyan-400', desc: 'Deep learning architectures for time-series.' },
    { id: 'chapter-5', title: 'Statistical Validation', icon: ShieldCheck, color: 'text-amber-400', desc: 'Accuracy metrics and backtesting strategies.' },
    { id: 'chapter-6', title: 'Model Versioning & MLOps', icon: Layers, color: 'text-indigo-400', desc: 'Managing the model lifecycle in production.' },
    { id: 'chapter-7', title: 'Real-Time Inference API', icon: TrendingUp, color: 'text-rose-400', desc: 'Low-latency deployment of forecasting models.' },
    { id: 'chapter-8', title: 'Cloud-Native Deployment', icon: Globe, color: 'text-blue-500', desc: 'Scaling the PEFM engine on modern infrastructure.' },
    { id: 'chapter-9', title: 'Interactive Visualization & Analytics', icon: LineChart, color: 'text-emerald-500', desc: 'High-fidelity market sentiment and trend dashboards.' },
    { id: 'chapter-10', title: 'Security, Ethics & Limitations', icon: ShieldCheck, color: 'text-amber-500', desc: 'Ensuring model integrity and ethical trade execution.' },
    { id: 'chapter-11', title: 'Conclusion & Future Work', icon: Book, color: 'text-indigo-500', desc: 'The roadmap for decentralized economic intelligence.' },
]

export default function EconomicsDocsPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-16"
            >
                <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white text-glow">
                    Economic <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">Forecasting</span>
                </h1>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                    End-to-end technical documentation for the Predictive Economic Forecasting Model (PEFM). A fusion of econometric rigor and deep learning.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chapters.map((chapter, index) => {
                    const Icon = chapter.icon
                    return (
                        <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <Link
                                href={`/work/academic/economics/${chapter.id}`}
                                className="group p-6 glass-panel rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 flex flex-col h-full bg-slate-900/40"
                            >
                                <div className={`p-3 rounded-xl bg-white/5 w-fit mb-6 transition-colors group-hover:bg-white/10 ${chapter.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Section 0{index + 1}</div>
                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                                        {chapter.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 italic font-light">
                                        {chapter.desc}
                                    </p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] text-gray-600 group-hover:text-blue-400 transition-colors uppercase font-bold tracking-widest">Read Chapter</span>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>

            {/* Manual CTA Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="mt-16 p-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-emerald-500/20 rounded-[40px]"
            >
                <div className="bg-slate-950/90 rounded-[38px] p-10 md:p-14 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">Explore the Implementation Manual</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto italic font-light">"A Production-Ready, Cloud-Native Platform for Market Trend Prediction and Statistical Analysis."</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/work/academic/economics/chapter-1"
                            className="px-8 py-3 bg-blue-500 rounded-2xl text-white font-bold hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
                        >
                            Start Manual
                        </Link>
                        <Link
                            href="/work/academic/economics/chapter-11"
                            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold hover:bg-white/10 transition-all"
                        >
                            System Future Work
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
