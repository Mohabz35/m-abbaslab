'use client'

import { motion } from 'framer-motion'
import { personalConfig } from '@/config/personal'
import * as Icons from 'lucide-react'

export default function ServicesPage() {
    const services = personalConfig.services

    return (
        <div className="min-h-screen bg-[#030014] pt-24 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white font-[family-name:var(--font-geist-mono)]">
                        Ecosystem <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#7000ff]">Services</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        Strategic solutions derived from a fusion of AI, Economics, and Fashion Tech.
                        I build systems that bridge the gap between intelligence and action.
                    </p>
                </motion.div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = (Icons as any)[service.icon] || Icons.Zap
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group p-8 glass-panel rounded-2xl border border-white/5 hover:border-[#00f0ff]/50 transition-all duration-300 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-[#00f0ff]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Icon className="w-8 h-8 text-[#00f0ff]" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">{service.title}</h3>
                                    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                                        {service.description || (service as any).Academic}
                                    </p>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                {/* Collaboration Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-10 glass-panel rounded-3xl border border-white/10 text-center"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Build the Future?</h2>
                    <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                        I am open to partnerships, investors, research institutions, and brands who want to leverage
                        AI-driven ecosystems for real-world impact.
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-10 py-4 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all"
                    >
                        Start a Collaboration
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
