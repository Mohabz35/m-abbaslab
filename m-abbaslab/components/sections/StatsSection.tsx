'use client'

import { motion } from 'framer-motion'
import { Users, FileText, Code, Globe } from 'lucide-react'
import { personalConfig } from '@/config/personal'

export default function StatsSection() {
  const stats = [
    { icon: FileText, value: personalConfig.articles.length, label: 'Scientific Output', suffix: 'Articles' },
    { icon: Code, value: personalConfig.projects.length, label: 'Digital Assets', suffix: 'Projects' },
    { icon: Users, value: '3+', label: 'Strategic Entities', suffix: 'Global' },
    { icon: Globe, value: '2026', label: 'Ecosystem', suffix: 'Foundation' },
  ]
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gray-900">By the </span>
            <span className="gradient-text">Numbers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quantifying impact through measurable results and continuous growth
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="text-center p-8 rounded-3xl bg-[#030014]/40 backdrop-blur-xl border border-white/5 hover:border-[#00f0ff]/30 transition-all duration-300"
              >
                <div className="inline-flex p-4 rounded-2xl bg-[#00f0ff]/10 mb-4 border border-[#00f0ff]/20">
                  <Icon className="w-8 h-8 text-[#00f0ff]" />
                </div>
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-white mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-500">
                  {stat.suffix}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Animated divider */}
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="mt-20 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full"
        />
      </div>
    </section>
  )
}