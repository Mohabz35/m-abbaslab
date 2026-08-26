'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Users, Heart, Brain, Code2, TrendingUp, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function InitiativesPage() {
  const initiatives = personalConfig.initiatives || []

  const systemDetails: Record<string, any> = {
    'AFYACONNECT': {
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      stats: [
        { label: 'Users', value: '100+', icon: Users },
        { label: 'Coverage', value: 'Kenya', icon: TrendingUp },
        { label: 'Status', value: 'Live', icon: CheckCircle2 },
      ],
      problem: 'Healthcare accessibility in Kenya is limited. Preventive care is underutilized.',
      solution: 'AI-powered platform connecting patients with preventive healthcare, reducing hospital admissions and improving public health outcomes.',
      impact: ['100+ active users', 'Prevention-focused approach', 'AI-powered diagnostics', 'Community health education'],
      tech: ['Next.js', 'AI/ML', 'Supabase', 'Stripe Payments']
    },
    'Chuka University ILMS': {
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      stats: [
        { label: 'Institution', value: 'Chuka University', icon: Users },
        { label: 'Features', value: 'AI+Adaptive', icon: Brain },
        { label: 'Status', value: 'Live', icon: CheckCircle2 },
      ],
      problem: 'Traditional learning management systems are static and lack adaptation to individual student needs.',
      solution: 'Intelligent LMS with AI assistant, adaptive learning paths, real-time student analytics, and personalized recommendations.',
      impact: ['Adaptive learning paths', 'AI virtual assistant', 'Real-time analytics', 'Personalized student experience'],
      tech: ['Next.js', 'AI/ML', 'PostgreSQL', 'React']
    },
    'QIS (Quantum Impact Syndicate)': {
      icon: Code2,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      stats: [
        { label: 'Members', value: 'Elite', icon: Users },
        { label: 'Focus', value: 'Quantitative', icon: Brain },
        { label: 'Status', value: 'Live', icon: CheckCircle2 },
      ],
      problem: 'Limited access to elite research collectives and quantitative finance platforms in Africa.',
      solution: 'Exclusive research syndicate providing PEFM engine (alpha generation), venture architecture workspace, and collaborative research infrastructure.',
      impact: ['Elite research community', 'PEFM alpha engine', 'Venture architecture', 'Cross-continental collaboration'],
      tech: ['Python', 'Machine Learning', 'QuantLib', 'Real-time Data']
    },
    'Royal Icon Events Voting System': {
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      stats: [
        { label: 'Deployment', value: '5 Counties', icon: TrendingUp },
        { label: 'Security', value: 'Verified', icon: CheckCircle2 },
        { label: 'Status', value: 'Live', icon: CheckCircle2 },
      ],
      problem: 'Traditional event voting is prone to fraud, lacks transparency, and disenfranchises participants.',
      solution: 'Secure, blockchain-verifiable voting system enabling transparent, tamper-proof elections for events and democratic participation.',
      impact: ['Verifiable voting', 'Zero fraud', 'Transparent results', 'Democratic participation'],
      tech: ['Blockchain', 'Smart Contracts', 'Next.js', 'Web3']
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-20 pt-8">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
          <Code2 className="w-8 h-8 text-cyan-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
          Systems That <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">Matter</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
          Building AI-powered systems across healthcare, education, research, and governance. Digital empowerment in action.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold">
          <Zap className="w-4 h-4" />
          4 Live Systems • Nationwide Impact • Kenya-First Innovation
        </div>
      </motion.div>

      {/* INITIATIVES GRID */}
      <div className="space-y-16 mb-24">
        {initiatives.map((initiative: any, i: number) => {
          const details = systemDetails[initiative.name]
          const IconComponent = details.icon

          return (
            <motion.div
              key={initiative.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              {/* Left: Content */}
              <div>
                <div className={`inline-flex items-center justify-center p-3 mb-4 rounded-2xl ${details.bgColor} border ${details.borderColor}`}>
                  <IconComponent className={`w-6 h-6 bg-gradient-to-r ${details.color} bg-clip-text text-transparent`} />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{initiative.name}</h2>
                <p className="text-gray-400 text-lg mb-6">{initiative.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {details.stats.map((stat: any) => {
                    const StatIcon = stat.icon
                    return (
                      <div key={stat.label} className={`glass-panel p-4 rounded-xl border ${details.borderColor}`}>
                        <StatIcon className="w-4 h-4 mb-2 opacity-70" />
                        <p className="text-white font-bold text-lg">{stat.value}</p>
                        <p className="text-gray-400 text-xs">{stat.label}</p>
                      </div>
                    )
                  })}
                </div>

                {/* Problem & Solution */}
                <div className="space-y-4 mb-8">
                  <div>
                    <h3 className="text-white font-bold mb-2 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                      The Problem
                    </h3>
                    <p className="text-gray-400 text-sm">{details.problem}</p>
                  </div>
                  <div>
                    <h3 className="text-white font-bold mb-2 flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      Our Solution
                    </h3>
                    <p className="text-gray-300 text-sm">{details.solution}</p>
                  </div>
                </div>

                {/* Impact */}
                <div className="mb-8">
                  <h3 className="text-white font-bold mb-3">Impact</h3>
                  <ul className="space-y-2">
                    {details.impact.map((point: string) => (
                      <li key={point} className="text-gray-300 text-sm flex items-start">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-white font-bold mb-3">Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {details.tech.map((tech: string) => (
                      <span key={tech} className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${details.color} bg-clip-text text-transparent border ${details.borderColor}`}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className={`glass-panel p-8 rounded-3xl border ${details.borderColor} bg-gradient-to-br ${details.bgColor}`}
              >
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center p-8 rounded-3xl bg-gradient-to-br ${details.color} bg-clip-text text-transparent mb-6`}>
                      <IconComponent className="w-24 h-24" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{initiative.type}</h3>
                    <p className="text-gray-400">{initiative.status}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-panel p-12 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Building Africa's AI-First Ecosystem</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          These systems represent a vision: technology can solve real problems, empower communities, and build nations. Let us continue building.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/advocacy"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all"
          >
            Learn About My Advocacy
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <a
            href="mailto:hello@www.mohammedabbas.tech"
            className="inline-flex items-center justify-center px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Partner With Us
            <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
