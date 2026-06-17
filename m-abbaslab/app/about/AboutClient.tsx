'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Code, BarChart3, Lightbulb, Shield, Zap, Target,
  GraduationCap, Briefcase, Brain, TrendingUp, Cpu,
  Database, Globe, ArrowRight, CheckCircle, Star
} from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 } }

const approachItems = [
  { icon: Target, title: 'Systematic', desc: 'I understand problems deeply before designing solutions', color: 'text-[#00f0ff]' },
  { icon: BarChart3, title: 'Data-Driven', desc: 'Every decision backed by rigorous analysis', color: 'text-purple-400' },
  { icon: TrendingUp, title: 'Scalable', desc: 'Built for growth from day one', color: 'text-emerald-400' },
  { icon: Shield, title: 'Reliable', desc: 'Systems you can depend on', color: 'text-amber-400' },
  { icon: Lightbulb, title: 'Practical', desc: 'Elegant solutions that actually work', color: 'text-pink-400' },
]

const expertiseCategories = [
  {
    title: 'Development',
    icon: Code,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
    skills: ['React', 'Next.js', 'Node.js', 'TypeScript', 'GraphQL', 'REST APIs', 'PostgreSQL', 'Docker'],
  },
  {
    title: 'Data Science',
    icon: BarChart3,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/20',
    textColor: 'text-purple-400',
    skills: ['Python', 'NumPy', 'SciPy', 'Pandas', 'Machine Learning', 'Statistical Modeling', 'Econometrics'],
  },
  {
    title: 'Systems',
    icon: Cpu,
    color: 'from-emerald-500/20 to-green-500/20',
    borderColor: 'border-emerald-500/20',
    textColor: 'text-emerald-400',
    skills: ['Cloud Architecture', 'Database Design', 'DevOps', 'System Design', 'Performance Optimization'],
  },
]

const highlights = [
  { metric: '100+', label: 'Users served via AFYACONNECT healthcare platform', icon: Globe },
  { metric: '99%+', label: 'Data accuracy across 500+ record validation systems', icon: Database },
  { metric: '2', label: 'Ventures founded and scaled', icon: Briefcase },
  { metric: '5+', label: 'Team members led on technical projects', icon: Users },
]

const explorations = [
  { icon: Brain, label: 'AI/ML systems and their real-world applications' },
  { icon: BarChart3, label: 'Computational statistics and research' },
  { icon: Globe, label: 'Remote technical leadership opportunities' },
  { icon: Zap, label: 'Building intelligent systems that solve complex problems' },
  { icon: Code, label: 'Bridging data science with product engineering' },
]

function Users(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export default function AboutClient({ config }: { config: any }) {
  const roles: string[] = config?.roles || []
  const skills: Record<string, string[]> = config?.skills || {}
  const education: any[] = config?.education || []
  const experience: any[] = config?.experience || []
  const researchInterests: string[] = config?.researchInterests || []

  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#00f0ff]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#7000ff]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">

        {/* ═══════════════ HERO ═══════════════ */}
        <motion.div {...fadeUp} className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 mb-6">
            <Zap className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-sm text-[#00f0ff] font-medium">About Me</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#00f0ff] via-white to-[#7000ff] bg-clip-text text-transparent leading-tight">
            Building Intelligent Systems.<br />Solving Complex Problems.<br />Driving Measurable Impact.
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            I&apos;m a full-stack engineer, data scientist, and entrepreneur combining technical depth with strategic thinking to create solutions that scale.
          </p>
        </motion.div>

        {/* ═══════════════ THE STORY ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-20"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 flex items-center justify-center">
                <span className="text-[#00f0ff] font-mono text-sm">01</span>
              </span>
              The Story
            </h2>
            <div className="space-y-6 text-gray-400 leading-relaxed text-lg">
              <p>
                With a background in statistics and hands-on experience across technology, healthcare, and economics, I&apos;ve developed a unique perspective on problem-solving. I don&apos;t just build software — I architect systems that create real value.
              </p>
              <p>
                My journey started with a passion for understanding the world through data. I learned to code to turn insights into action. I founded ventures to understand how businesses work. I led teams to learn how to execute at scale. Each experience shaped how I approach challenges today.
              </p>
              <p className="text-white font-medium border-l-4 border-[#00f0ff] pl-6 py-2">
                &ldquo;I believe the best solutions emerge from combining rigorous analysis with creative thinking. I approach every challenge systematically — understanding deeply, designing elegantly, executing precisely.&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════ WHAT I DO ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-mono text-sm">02</span>
            </span>
            What I Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: 'Full-Stack Development',
                desc: 'I architect and build scalable applications using modern technologies. From healthcare platforms serving 100+ users to complex data systems, I combine clean code with thoughtful design.',
                color: 'blue',
              },
              {
                icon: BarChart3,
                title: 'Data Science',
                desc: 'I transform raw data into actionable insights. Expertise in statistical modeling, econometrics, and computational analysis. I\'ve built systems maintaining 99%+ data accuracy across complex datasets.',
                color: 'purple',
              },
              {
                icon: Lightbulb,
                title: 'Strategic Thinking',
                desc: 'I bring entrepreneurial perspective to technical challenges. I\'ve founded ventures, led teams, and managed complex projects from conception to execution.',
                color: 'amber',
              },
            ].map((item, idx) => {
              const Icon = item.icon
              const colorMap: Record<string, string> = {
                blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20 text-blue-400',
                purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/20 text-purple-400',
                amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/20 text-amber-400',
              }
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.25 + idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="p-8 rounded-2xl border border-white/10 bg-black/30 hover:border-white/20 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[item.color]} border flex items-center justify-center mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ MY APPROACH ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 font-mono text-sm">03</span>
            </span>
            My Approach
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {approachItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 + idx * 0.08 }}
                  className="p-6 rounded-2xl border border-white/5 bg-black/20 text-center hover:border-white/10 transition-all"
                >
                  <Icon className={`w-6 h-6 ${item.color} mx-auto mb-3`} />
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ TECHNICAL EXPERTISE ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#7000ff]/10 border border-[#7000ff]/20 flex items-center justify-center">
              <span className="text-[#7000ff] font-mono text-sm">04</span>
            </span>
            Technical Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {expertiseCategories.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 + idx * 0.1 }}
                  className={`p-6 rounded-2xl border ${cat.borderColor} bg-gradient-to-br ${cat.color} transition-all`}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <Icon className={`w-5 h-5 ${cat.textColor}`} />
                    <h3 className={`font-bold ${cat.textColor}`}>{cat.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 bg-white/5 text-gray-300 text-xs rounded-full border border-white/5">
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Dynamic skills from Supabase */}
          {Object.keys(skills).length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(skills).map(([category, skillList]) => (
                <div key={category} className="p-6 rounded-2xl border border-white/5 bg-black/20">
                  <h3 className="font-bold text-sm text-white mb-4 capitalize">{category.replace('-', ' ')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(skillList as string[]).map((item: string) => (
                      <span key={item} className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/5">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══════════════ PROFESSIONAL HIGHLIGHTS ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 font-mono text-sm">05</span>
            </span>
            Professional Highlights
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((h, idx) => {
              const Icon = h.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 + idx * 0.08 }}
                  className="p-6 rounded-2xl border border-white/5 bg-black/30 text-center"
                >
                  <Icon className="w-5 h-5 text-[#00f0ff] mx-auto mb-3" />
                  <div className="text-3xl font-bold text-white font-mono mb-2">{h.metric}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{h.label}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ EDUCATION & EXPERIENCE ═══════════════ */}
        {(education.length > 0 || experience.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <span className="text-pink-400 font-mono text-sm">06</span>
              </span>
              Experience & Education
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {experience.length > 0 && (
                <div className="space-y-6">
                  {experience.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute left-0 top-2 w-3 h-3 bg-purple-500 rounded-full" />
                      <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-white/10" />
                      <h3 className="font-bold text-white">{exp.role}</h3>
                      <p className="text-xs text-gray-500 mb-2">{exp.period}</p>
                      <p className="text-sm text-gray-400 mb-2">{exp.description}</p>
                      {exp.achievements && (
                        <ul className="space-y-1">
                          {exp.achievements.map((a: string, i: number) => (
                            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {education.length > 0 && (
                <div className="space-y-6">
                  {education.map((edu: any, idx: number) => (
                    <div key={idx} className="relative pl-8">
                      <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full" />
                      <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-white/10" />
                      <h3 className="font-bold text-white">{edu.degree}</h3>
                      <p className="text-sm text-[#00f0ff]">{edu.institution}</p>
                      <p className="text-xs text-gray-500 mb-1">{edu.period} {edu.status && `• ${edu.status}`}</p>
                      {edu.focus && <p className="text-sm text-gray-400">{edu.focus}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ CURRENTLY EXPLORING ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 font-mono text-sm">07</span>
            </span>
            Currently Exploring
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {explorations.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 + idx * 0.08 }}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-white/5 bg-black/20 hover:border-white/10 transition-all"
                >
                  <Icon className="w-5 h-5 text-[#00f0ff] flex-shrink-0" />
                  <span className="text-sm text-gray-300">{item.label}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* ═══════════════ RESEARCH INTERESTS ═══════════════ */}
        {researchInterests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-white mb-10 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400 font-mono text-sm">08</span>
              </span>
              Research Interests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {researchInterests.map((interest, index) => (
                <motion.div
                  key={interest}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-black/20 hover:border-[#00f0ff]/20 transition-all"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-300">{interest}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══════════════ CTA ═══════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="text-center p-8 md:p-12 rounded-3xl border border-white/10 bg-gradient-to-br from-[#00f0ff]/5 via-transparent to-[#7000ff]/5"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            If you&apos;re working on something interesting — whether it&apos;s a technical challenge, a data problem, or a strategic opportunity — I&apos;d love to hear about it.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center gap-2"
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/work"
              className="px-8 py-3 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all"
            >
              View My Work
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
