'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, FolderOpen, Trophy, Zap, Brain, Code2, Users, Rocket, Target, Award, Mail, ExternalLink, ChevronDown, ChevronUp, TrendingUp, Shield, Lightbulb, Handshake, Star } from 'lucide-react'
import Link from 'next/link'
import ProjectCard from '@/components/ProjectCard'

type Project = {
  id: string
  title: string
  description: string
  longDescription?: string
  technologies: string[]
  github_url: string
  live_url: string
  category: string
  featured?: boolean
  status?: string
  year?: string
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [showPlaybook, setShowPlaybook] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/public/projects')
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          setProjects(res.projects || [])
          setFilteredProjects(res.projects || [])
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...projects]
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.technologies || []).some(t => t.toLowerCase().includes(q))
      )
    }
    setFilteredProjects(result)
  }, [selectedCategory, projects, searchQuery])

  const categories = (() => {
    const cats: Record<string, number> = { all: projects.length }
    for (const p of projects) {
      const c = p.category || 'other'
      cats[c] = (cats[c] || 0) + 1
    }
    return Object.entries(cats).map(([id, count]) => ({
      id,
      name: id === 'all' ? 'All Projects' : id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
      count,
    }))
  })()

  const stats = {
    totalProjects: projects.length,
    categories: new Set(projects.map(p => p.category).filter(Boolean)).size,
    technologies: new Set(projects.flatMap(p => p.technologies || [])).size,
    featured: projects.filter(p => p.featured).length,
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-lg">Loading projects...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16">
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20">
          <FolderOpen className="w-8 h-8 text-[#00f0ff]" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          My <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Work</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-4">
          A collection of projects at the intersection of economics, technology, and research.
          Each project represents a unique challenge and innovative solution.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-semibold">
          <Rocket className="w-4 h-4" />
          Available for Hackathons & Collaborations
        </div>
      </motion.div>

      {/* QUICK STATS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: 'text-[#00f0ff]' },
          { label: 'Categories', value: stats.categories, icon: Target, color: 'text-purple-400' },
          { label: 'Technologies', value: stats.technologies, icon: Code2, color: 'text-green-400' },
          { label: 'Featured', value: stats.featured, icon: Star, color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-panel p-6 rounded-2xl border border-white/5 text-center hover:border-[#00f0ff]/30 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2 relative z-10`} />
            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{stat.value}</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* WHY I WIN HACKATHONS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Zap className="w-8 h-8 mr-4 text-amber-500" />
            Why I Win Hackathons
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Speed & Execution', desc: 'Full-stack MVP in 24 hours. Rapid prototyping with pre-built component library and proven deployment pipeline.', iconClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
            { icon: Brain, title: 'Multi-Disciplinary', desc: 'Economics + Statistics + Engineering. Unique problem-solving approach with cross-domain insights.', iconClass: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
            { icon: TrendingUp, title: 'Data-Driven', desc: 'Statistical rigor in design. Data-backed decisions, metrics-focused approach, scalability built-in.', iconClass: 'bg-green-500/10 border-green-500/20 text-green-400' },
            { icon: Lightbulb, title: 'AI/ML Integration', desc: 'Advanced ML capabilities. NLP, Computer Vision, Forecasting. Production-ready AI features.', iconClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' },
            { icon: Shield, title: 'Business Acumen', desc: 'Understands market dynamics. Can pitch effectively, scale solutions, and think about monetization.', iconClass: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
            { icon: Code2, title: 'Full-Stack Mastery', desc: 'Frontend, Backend, DevOps. Can build anything solo or lead a team. End-to-end ownership.', iconClass: 'bg-pink-500/10 border-pink-500/20 text-pink-400' },
          ].map((advantage, i) => (
            <motion.div
              key={advantage.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${advantage.iconClass}`}>
                <advantage.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{advantage.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{advantage.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* STRATEGIC PORTALS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <a href="/quantum-impact-syndicate" className="group relative overflow-hidden rounded-3xl p-8 border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/10 to-black hover:border-[#00f0ff] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-3xl group-hover:bg-[#00f0ff]/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-bold uppercase tracking-widest mb-4">Member Portal</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">Quantum Impact Syndicate</h2>
            <p className="text-sm text-gray-400 mb-6">Access the elite research collective, PEFM Engine alpha frameworks, and exclusive venture architecture workspace.</p>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#00f0ff]">Initialize QIS Gateway <span>&rarr;</span></div>
          </div>
        </a>
        <a href="/cv-generator" className="group relative overflow-hidden rounded-3xl p-8 border border-[#7000ff]/30 bg-gradient-to-br from-[#7000ff]/10 to-black hover:border-[#7000ff] transition-all duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/10 rounded-full blur-3xl group-hover:bg-[#7000ff]/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full border border-[#7000ff]/30 bg-[#7000ff]/10 text-[#7000ff] text-[10px] font-bold uppercase tracking-widest mb-4">Automated Utility</div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#7000ff] transition-colors">CV Architect Generator</h2>
            <p className="text-sm text-gray-400 mb-6">Dynamically generate categorized, professional Curriculum Vitae tailored for academia, tech, fashion, or analysis.</p>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#7000ff]">Access CV Utility <span>&rarr;</span></div>
          </div>
        </a>
      </motion.div>

      {/* SEARCH & FILTER */}
      <div className="mb-12">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00f0ff]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, technologies..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00f0ff]"
            />
          </div>
          <div className="flex items-center">
            <span className="text-gray-400 text-sm mr-2">{filteredProjects.length} projects</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 border ${selectedCategory === category.id
                ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{category.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id ? 'bg-[#00f0ff]/20 text-white' : 'bg-white/10 text-gray-500'}`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PROJECTS GRID */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory + searchQuery}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24"
        >
          {filteredProjects.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} featured={project.featured} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* EMPTY STATE */}
      {filteredProjects.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-panel rounded-3xl border border-white/5 mb-24">
          <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
          <h3 className="text-2xl font-bold mb-3 text-white">No Projects Found</h3>
          <p className="text-gray-500 mb-8">Try selecting a different category or search term</p>
          <button onClick={() => { setSelectedCategory('all'); setSearchQuery('') }} className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all">
            Show All Projects
          </button>
        </motion.div>
      )}

      {/* LOOKING FOR PARTNERS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Handshake className="w-8 h-8 mr-4 text-[#00f0ff]" />
            Looking for Hackathon Partners
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-[#00f0ff]/30 transition-all">
            <h3 className="text-xl font-semibold text-white mb-6">Team Composition</h3>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#00f0ff]/5 border border-[#00f0ff]/10">
                <h4 className="text-white font-bold mb-1">Lead: Full-Stack Development + Product</h4>
                <p className="text-gray-400 text-sm">You - Full-stack development, technical leadership, AI/ML</p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                <h4 className="text-white font-bold mb-1">Seeking: UI/UX Designer</h4>
                <p className="text-gray-400 text-sm">Figma, Tailwind, component design, rapid prototyping</p>
              </div>
              <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                <h4 className="text-white font-bold mb-1">Seeking: Domain Expert</h4>
                <p className="text-gray-400 text-sm">FinTech, HealthTech, Climate Tech, or EdTech knowledge</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <h4 className="text-white font-bold mb-1">Seeking: Growth Hacker</h4>
                <p className="text-gray-400 text-sm">Marketing, pitch preparation, user acquisition</p>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-[#00f0ff]/30 transition-all">
            <h3 className="text-xl font-semibold text-white mb-6">Hackathon Interests</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {['FinTech', 'AI/ML', 'EdTech', 'HealthTech', 'Climate Tech', 'Fashion Tech', 'Data Science', 'Web3'].map((interest) => (
                <span key={interest} className="px-4 py-2 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full text-sm border border-[#00f0ff]/20">{interest}</span>
              ))}
            </div>
            <h3 className="text-xl font-semibold text-white mb-4">Strengths to Offer</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Rapid Prototyping', 'Technical Leadership', 'AI/ML Expertise', 'Data Analysis', 'Pitch Preparation', 'Full-Stack Dev'].map((s) => (
                <div key={s} className="flex items-center gap-2 text-gray-300 text-sm">
                  <Target className="w-4 h-4 text-[#00f0ff]" />{s}
                </div>
              ))}
            </div>
            <a href="mailto:hello@m-abbaslab.com" className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all">
              <Mail className="w-4 h-4" />Contact for Collaboration
            </a>
          </div>
        </div>
      </motion.div>

      {/* HACKATHON PLAYBOOK */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Award className="w-8 h-8 mr-4 text-amber-500" />
            Hackathon Playbook
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
          <button onClick={() => setShowPlaybook(!showPlaybook)} className="ml-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-sm">
            {showPlaybook ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showPlaybook ? 'Collapse' : 'Expand'}
          </button>
        </div>

        <AnimatePresence>
          {showPlaybook && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { phase: 'Pre-Hackathon', items: ['Research theme & judging criteria', 'Identify team members', 'Prepare starter templates', 'Set up dev environment', 'Plan MVP scope'] },
                  { phase: 'Day 1 Start', items: ['Form team (30 min)', 'Brainstorm & validate ideas (1 hr)', 'Divide work & start building', 'Commit to MVP scope'] },
                  { phase: 'Execution', items: ['Build MVP features (16 hrs)', 'Deploy early & often', 'Get user feedback', 'Iterate based on feedback', 'Prepare demo video'] },
                  { phase: 'Final Push', items: ['Polish UI/UX', 'Test thoroughly', 'Prepare 5-min pitch', 'Practice presentation', 'Submit before deadline'] },
                ].map((step, i) => (
                  <div key={step.phase} className="glass-panel p-6 rounded-2xl border border-white/10">
                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 text-sm font-bold">{i + 1}</span>
                      {step.phase}
                    </h4>
                    <ul className="space-y-2">
                      {step.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-gray-400 text-sm">
                          <Target className="w-3 h-3 mt-1 text-amber-400 flex-shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
