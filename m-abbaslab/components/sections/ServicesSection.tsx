'use client'

import { motion } from 'framer-motion'
import { Cpu, LineChart, Code, Zap } from 'lucide-react'
import { personalConfig } from '@/config/personal'

const iconMap: any = {
    Cpu,
    LineChart,
    Code,
    Zap
}

export default function ServicesSection() {
    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold mb-6 text-white">
                        Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Competencies</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Delivering value through a unique combination of technical expertise and analytical rigor.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {personalConfig.site.skillFeatures.map((feature, index) => {
                        const Icon = iconMap[feature.icon] || Zap
                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-blue-500/30 transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
