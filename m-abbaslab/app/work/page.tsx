'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Filter, FolderOpen } from 'lucide-react'
import ProjectCard from '@/components/ProjectCard'
import { personalConfig } from '@/config/personal'

export default function WorkPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredProjects, setFilteredProjects] = useState<any[]>([...personalConfig.projects])

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProjects([...personalConfig.projects])
    } else {
      setFilteredProjects([...personalConfig.projects].filter(project => project.category === selectedCategory))
    }
  }, [selectedCategory])

  // Dynamic category generation based on available projects
  const categories = [
    { id: 'all', name: 'All Projects', count: personalConfig.projects.length },
    { id: 'research', name: 'Research', count: personalConfig.projects.filter(p => p.category === 'research').length },
    { id: 'academic', name: 'Academic', count: personalConfig.projects.filter(p => p.category === 'academic').length },
    { id: 'technology', name: 'Technology', count: personalConfig.projects.filter(p => p.category === 'technology').length },
    { id: 'analysis', name: 'Analysis', count: personalConfig.projects.filter(p => p.category === 'analysis').length },
    { id: 'platform', name: 'Platform', count: personalConfig.projects.filter(p => p.category === 'platform').length },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#00f0ff]/10 border border-[#00f0ff]/20">
          <FolderOpen className="w-8 h-8 text-[#00f0ff]" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
          My <span className="bg-gradient-to-r from-[#00f0ff] to-[#7000ff] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Work</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          A collection of projects at the intersection of economics, technology, and research.
          Each project represents a unique challenge and innovative solution.
        </p>
      </motion.div>

      {/* Strategic Portals (Quick Links) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16"
      >
        <a 
          href="/quantum-impact-syndicate"
          className="group relative overflow-hidden rounded-3xl p-8 border border-[#00f0ff]/30 bg-gradient-to-br from-[#00f0ff]/10 to-black hover:border-[#00f0ff] transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/10 rounded-full blur-3xl group-hover:bg-[#00f0ff]/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-[10px] font-bold uppercase tracking-widest mb-4">
              Member Portal
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">Quantum Impact Syndicate</h2>
            <p className="text-sm text-gray-400 mb-6">Access the elite research collective, PEFM Engine alpha frameworks, and exclusive venture architecture workspace.</p>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#00f0ff]">
              Initialize QIS Gateway <span>→</span>
            </div>
          </div>
        </a>

        <a 
          href="/cv-generator"
          className="group relative overflow-hidden rounded-3xl p-8 border border-[#7000ff]/30 bg-gradient-to-br from-[#7000ff]/10 to-black hover:border-[#7000ff] transition-all duration-500"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#7000ff]/10 rounded-full blur-3xl group-hover:bg-[#7000ff]/30 transition-all duration-500" />
          <div className="relative z-10">
            <div className="inline-flex px-3 py-1 rounded-full border border-[#7000ff]/30 bg-[#7000ff]/10 text-[#7000ff] text-[10px] font-bold uppercase tracking-widest mb-4">
              Automated Utility
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-[#7000ff] transition-colors">CV Architect Generator</h2>
            <p className="text-sm text-gray-400 mb-6">Dynamically generate categorized, professional Curriculum Vitae tailored for academia, tech, fashion, or analysis.</p>
            <div className="inline-flex items-center gap-2 text-sm font-bold text-[#7000ff]">
              Access CV Utility <span>→</span>
            </div>
          </div>
        </a>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl font-bold flex items-center text-white">
            <Filter className="w-5 h-5 mr-3 text-[#00f0ff]" />
            Filter Projects
          </h2>
          <span className="text-gray-400">{filteredProjects.length} projects</span>
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
              <span className={`px-2 py-0.5 rounded-full text-xs ${selectedCategory === category.id
                ? 'bg-[#00f0ff]/20 text-white'
                : 'bg-white/10 text-gray-500'
                }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Projects Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project) => (
            <div key={project.id}>
              <ProjectCard project={project} featured={project.featured} />
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 glass-panel rounded-3xl border border-white/5"
        >
          <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
          <h3 className="text-2xl font-bold mb-3 text-white">No Projects Found</h3>
          <p className="text-gray-500 mb-8">Try selecting a different category</p>
          <button
            onClick={() => setSelectedCategory('all')}
            className="px-6 py-3 bg-gradient-to-r from-[#00f0ff] to-[#7000ff] text-white font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(112,0,255,0.4)] transition-all"
          >
            Show All Projects
          </button>
        </motion.div>
      )}
    </div>
  )
}
