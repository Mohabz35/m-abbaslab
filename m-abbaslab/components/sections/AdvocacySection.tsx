'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Globe, Shield, Users, Zap } from 'lucide-react'
import Link from 'next/link'

export default function AdvocacySection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f0ff]/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-md">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Human Empowerment</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white tracking-tight">
            Bridging Purpose, Prosperity,{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              &amp; Digital Resilience
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Empowering communities through technology, fostering economic inclusion,
            and building digital infrastructure that serves humanity — not the other way around.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Users,
              title: 'Community First',
              description: 'Building tools and platforms that put people at the center — from digital literacy programs to accessible tech solutions for underserved communities.',
              color: 'from-emerald-500/20 to-green-500/20',
              iconColor: 'text-emerald-400',
              borderColor: 'hover:border-emerald-500/50',
            },
            {
              icon: Zap,
              title: 'Digital Prosperity',
              description: 'Creating economic opportunities through technology — fintech solutions, e-commerce platforms, and skills training that unlock earning potential.',
              color: 'from-cyan-500/20 to-blue-500/20',
              iconColor: 'text-cyan-400',
              borderColor: 'hover:border-cyan-500/50',
            },
            {
              icon: Shield,
              title: 'Digital Resilience',
              description: 'Strengthening communities against digital threats — cybersecurity awareness, data sovereignty, and infrastructure that communities can trust and own.',
              color: 'from-purple-500/20 to-indigo-500/20',
              iconColor: 'text-purple-400',
              borderColor: 'hover:border-purple-500/50',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className={`glass-panel p-8 rounded-3xl border border-white/10 ${item.borderColor} transition-all duration-500 group relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-br ${item.color} rounded-full blur-[60px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 border border-white/10 relative z-10`}>
                <item.icon className={`w-7 h-7 ${item.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed relative z-10">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <Link
            href="/work"
            className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] transition-all duration-300 group"
          >
            Explore My Advocacy
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
