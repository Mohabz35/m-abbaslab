'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Sparkles } from 'lucide-react'
import Link from 'next/link'

const projects = [
  {
    title: 'Economic Forecasting Model',
    description: 'Machine learning model for predicting market trends with 95% accuracy',
    tags: ['Python', 'TensorFlow', 'Economics'],
    category: 'Research',
    link: '#',
    github: '#',
    color: 'blue',
  },
  {
    title: 'Data Visualization Platform',
    description: 'Interactive dashboard for real-time economic data analysis',
    tags: ['React', 'D3.js', 'TypeScript'],
    category: 'Technology',
    link: '#',
    github: '#',
    color: 'purple',
  },
  {
    title: 'Policy Impact Analysis',
    description: 'Quantitative analysis of economic policies using statistical models',
    tags: ['R', 'Statistics', 'Research'],
    category: 'Analysis',
    link: '#',
    github: '#',
    color: 'green',
  },
]

export default function FeaturedWork() {
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
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500"
            >
              {/* Category badge */}
              <div className="absolute top-6 left-6 z-10">
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold bg-${project.color}-100 text-${project.color}-800`}>
                  {project.category}
                </span>
              </div>

              {/* Project image placeholder */}
              <div className="h-48 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-${project.color}-400/20 to-${project.color}-600/20`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-${project.color}-500 to-${project.color}-700 opacity-20 blur-2xl`} />
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex items-center justify-between">
                  <Link
                    href={project.link}
                    className="flex items-center space-x-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    <span>View Project</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <a
                    href={project.github}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 rounded-3xl transition-all duration-500 pointer-events-none" />
            </motion.div>
          ))}
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