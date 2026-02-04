'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Filter, Calendar, MapPin, Users, Trophy, Star, TrendingUp, Layers, ArrowRight, Sparkles, Award, ExternalLink, Heart } from 'lucide-react'
import { personalConfig } from '@/config/personal'
import Link from 'next/link'
import Image from 'next/image'

export default function FashionPage() {
  const { fashion, projects } = personalConfig
  const [selectedCategory, setSelectedCategory] = useState('all')

  const fashionProjects = projects.filter(p => {
    const isFashionCategory = p.category === 'fashion-tech'
    const hasFashionTag = (p as any).tags?.some((t: string) => ['Fashion Tech', 'Modeling'].includes(t))
    const hasFashionTech = p.technologies?.some(t => ['Fashion Tech', '3D Modeling', 'WebGL'].includes(t))
    return isFashionCategory || hasFashionTag || hasFashionTech
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 pt-8 relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-md">
          <Camera className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium text-pink-400">
            Fashion & Modeling
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
          Fashion <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Portfolio</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
          Where artistic expression meets precision. Exploring the intersection of
          <span className="text-pink-400 font-semibold"> Runway</span>,
          <span className="text-purple-400 font-semibold"> Commercial</span>, and
          <span className="text-blue-400 font-semibold"> Fashion Tech</span>.
        </p>

        <Link
          href="/fashion/gallery"
          className="inline-flex items-center px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10 hover:border-pink-500/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300 group"
        >
          <Camera className="w-5 h-5 mr-3 text-pink-500 group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-wide">Enter Visual Gallery</span>
          <ArrowRight className="w-5 h-5 ml-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24"
      >
        {fashion.categories.map((cat, index) => (
          <div key={cat.id} className="glass-panel p-6 rounded-2xl border border-white/5 text-center hover:border-pink-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{cat.count}</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">{cat.name}</p>
          </div>
        ))}
      </motion.div>

      {/* SECTION 1: Titles & Achievements (Grid) */}
      <div className="mb-24 relative">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Trophy className="w-8 h-8 mr-4 text-amber-500" />
            Titles & Achievements
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fashion.titles.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl glass-panel border border-white/10 hover:border-pink-500/50 transition-all duration-500"
            >
              <div className="h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opactiy-80" />
                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                  quality={85}
                />

                <div className="absolute top-4 left-4 z-20">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {item.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-black border border-amber-500/30 flex items-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                    <Trophy className="w-3 h-3 mr-1" />
                    {item.achievement}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-pink-400 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-gray-300 font-mono text-sm bg-white/10 px-2 py-1 rounded">{item.year}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-400">
                    <MapPin className="w-3 h-3 mr-1" /> {item.location}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Runway Journey (Timeline) */}
      <div className="mb-24 relative">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <TrendingUp className="w-8 h-8 mr-4 text-pink-500" />
            Runway Journey
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>

        <div className="relative border-l-2 border-white/10 ml-4 md:ml-10 space-y-12">
          {personalConfig.runwayJourney?.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              {/* Dot */}
              <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] border-4 border-black" />

              <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <h4 className="text-6xl font-bold text-white">{milestone.year}</h4>
                </div>

                <span className="text-pink-400 font-mono text-sm mb-2 block">{milestone.year}</span>
                <h3 className="text-2xl font-bold text-white mb-3">{milestone.title}</h3>
                <p className="text-gray-400 mb-6 max-w-2xl">{milestone.description}</p>

                <div className="flex flex-wrap gap-3">
                  {milestone.highlights.map(highlight => (
                    <span key={highlight} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5 flex items-center">
                      <Star className="w-3 h-3 mr-2 text-yellow-500" />
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SECTION 3: Fashion Projects */}
      {fashionProjects.length > 0 && (
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white flex items-center">
              <Layers className="w-8 h-8 mr-4 text-blue-500" />
              Fashion Tech & Projects
            </h2>
            <div className="h-px bg-white/10 flex-1 ml-8" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {fashionProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 block">
                      {project.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-500 group-hover:text-blue-400 group-hover:-rotate-45 transition-all" />
                </div>
                <p className="text-gray-400 mb-6 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map(tech => (
                    <span key={tech} className="px-3 py-1 rounded bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Representation & Commercial */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="rounded-3xl glass-panel border border-white/10 p-10 md:p-16 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center">
            <Users className="w-8 h-8 mr-4 text-pink-500" />
            Representation & Commercial
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Agencies</h3>
              <div className="space-y-4">
                {fashion.representation.map((agency) => (
                  <div key={agency.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <h4 className="text-white font-bold">{agency.name}</h4>
                      <span className="text-sm text-gray-500">{agency.type}</span>
                    </div>
                    <span className="text-xs font-mono text-pink-400 border border-pink-500/20 px-2 py-1 rounded">
                      Since {agency.since}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-6">Commercial Focus</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Brand Ambassador', 'Product Shoots', 'TV Commercials', 'Social Media', 'Runway', 'Print Media'].map((tag) => (
                  <div key={tag} className="p-3 text-center rounded-lg bg-black/20 border border-white/5 text-gray-300 text-sm hover:text-white hover:border-pink-500/30 transition-colors">
                    {tag}
                  </div>
                ))}
              </div>
              <p className="mt-8 text-gray-500 text-sm italic border-t border-white/5 pt-4">
                "{fashion.note}"
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}