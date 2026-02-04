// components/ProjectCard.tsx
'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Star, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProjectCardProps {
  project: {
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
    year?: string // Added year property
  }
  featured?: boolean
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  // Category colors map (futuristic neon palette)
  const categoryColors: Record<string, string> = {
    'platform': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'ai-research': 'bg-green-500/10 text-green-400 border-green-500/20',
    'research': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'fashion-tech': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    'technology': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'analysis': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'data-science': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
  }

  const categoryColor = categoryColors[project.category] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  const categoryName = project.category.replace('-', ' ')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="group relative glass-panel rounded-3xl border border-white/5 hover:border-[#00f0ff]/50 overflow-hidden hover:shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all duration-500"
    >
      {/* Category badge */}
      <div className="absolute top-6 left-6 z-10">
        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-md ${categoryColor}`}>
          {categoryName.toUpperCase()}
        </span>
      </div>

      {/* Featured badge */}
      {featured && (
        <div className="absolute top-6 right-6 z-10">
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-400" />
            FEATURED
          </div>
        </div>
      )}

      {/* Project image/color placeholder */}
      <div className={`h-48 relative overflow-hidden bg-gradient-to-br from-[#030014] to-[#0a0a20]`}>
        {/* Abstract Gradient Blob */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`w-32 h-32 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity duration-500 ${project.category === 'research' ? 'bg-purple-500' :
              project.category === 'technology' ? 'bg-cyan-500' :
                'bg-blue-600'
            }`} />
        </div>
      </div>

      <div className="p-8 relative z-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{project.year || '2024'}</span>
          </div>
          <div className="flex items-center gap-2">
            {project.github_url && project.github_url !== '#' && (
              <a href={project.github_url} className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                <Github className="w-5 h-5" />
              </a>
            )}
            {featured && <TrendingUp className="w-5 h-5 text-amber-500" />}
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#00f0ff] transition-colors">
          {project.title}
        </h3>

        <p className="text-gray-400 mb-6 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 text-xs bg-white/5 text-gray-300 border border-white/5 rounded-full group-hover:border-[#00f0ff]/20 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <Link
            href={`/work/${project.id}`}
            className="flex items-center gap-2 text-[#00f0ff] font-semibold hover:text-[#7000ff] transition-colors group/link"
          >
            <span>View Details</span>
            <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Interactive border overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00f0ff]/20 rounded-3xl pointer-events-none transition-all duration-500" />
    </motion.div>
  )
}
