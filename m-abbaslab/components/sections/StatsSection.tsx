'use client'

import { motion } from 'framer-motion'
import { Users, FileText, Code, Globe } from 'lucide-react'

const stats = [
  { icon: FileText, value: '25+', label: 'Publications', suffix: 'Articles' },
  { icon: Code, value: '50+', label: 'Projects', suffix: 'Built' },
  { icon: Users, value: '100+', label: 'Collaborations', suffix: 'Global' },
  { icon: Globe, value: '5', label: 'Years', suffix: 'Experience' },
]

export default function StatsSection() {
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
                className="text-center p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="inline-flex p-4 rounded-2xl bg-blue-50 mb-4">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-800 mb-1">
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