'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { personalConfig } from '@/config/personal'

export default function FeaturedWork() {
  const featuredProjects = personalConfig.projects.filter(p => p.featured)

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">
              Featured Work
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Selected <span className="gradient-text">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore innovative solutions at the intersection of economics and technology
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProjects.map((project, index) => {
            const color = project.category === 'ecosystem' ? 'blue' : project.category === 'founder' ? 'purple' : 'green'
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#030014]/50 backdrop-blur-md shadow-2xl hover:shadow-[#00f0ff]/20 transition-all duration-500"
              >
                {/* Category badge */}
                <div className="absolute top-6 left-6 z-10">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-white border border-white/10`}>
                    {project.category}
                  </span>
                </div>

                {/* Project image placeholder */}
                <div className="h-48 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br from-[#00f0ff]/10 to-[#7000ff]/10`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#7000ff] opacity-10 blur-3xl`} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-[#00f0ff] transition-colors leading-tight">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 mb-6 text-sm line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.technologies.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] font-mono border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between">
                    <Link
                      href="/work"
                      className="flex items-center space-x-2 text-[#00f0ff] font-bold text-sm hover:text-white transition-colors"
                    >
                      <span>DETAILS</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10"
                        aria-label="GitHub"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00f0ff]/30 rounded-3xl transition-all duration-500 pointer-events-none" />
              </motion.div>
            )
          })}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Link
            href="/work"
            className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl border-2 border-gray-300 text-lg font-semibold hover:border-blue-500 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
          >
            <span>View All Projects</span>
            <span className="text-blue-500">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}