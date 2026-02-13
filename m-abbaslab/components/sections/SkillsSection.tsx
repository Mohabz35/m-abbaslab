'use client'

import { motion } from 'framer-motion'
import { personalConfig } from '@/config/personal'

export default function SkillsSection() {
    const skills = personalConfig.skills

    return (
        <section className="py-20 bg-black/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <h2 className="text-3xl font-bold mb-8 text-white">Technical Arsenal</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Object.entries(skills).map(([category, items], idx) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="space-y-4"
                            >
                                <h3 className="text-xl font-semibold text-blue-400 capitalize border-b border-white/10 pb-2">
                                    {category.replace('-', ' ')}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {items.map((skill) => (
                                        <span
                                            key={skill}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
