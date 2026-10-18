'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Calendar, MapPin, Users, Trophy, Star, TrendingUp, Layers, ArrowRight, Sparkles, ExternalLink, Heart, Search, Eye, Images } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Lightbox from '@/components/ui/Lightbox'

type FashionItem = {
  id: string
  title: string
  collection?: string
  category?: string
  status?: string
  image_url?: string
  gallery_images?: string[]
  description?: string
  location?: string
  event_date?: string
  tags?: string[]
  created_at?: string
}

type FashionProject = {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  technologies?: string[]
}

type RunwayMilestone = {
  id: string
  year?: string
  title?: string
  description?: string
  highlights?: string[]
  image_url?: string
  category?: string
  display_order?: number
}

type GalleryItem = {
  id: string
  title: string
  description?: string
  category?: string
  image: string
  location?: string
  eventDate?: string
  achievement?: string
}

export default function FashionPage() {
  const [fashionItems, setFashionItems] = useState<FashionItem[]>([])
  const [projects, setProjects] = useState<FashionProject[]>([])
  const [runwayJourney, setRunwayJourney] = useState<RunwayMilestone[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    Promise.all([
      fetch('/api/public/fashion').then(r => r.json()),
      fetch('/api/public/projects').then(r => r.json()),
      fetch('/api/public/runway').then(r => r.json()),
    ]).then(([fashionRes, projectsRes, runwayRes]) => {
      if (fashionRes.success) setFashionItems(fashionRes.items || [])
      if (projectsRes.success) setProjects(projectsRes.projects || [])
      if (runwayRes.success) setRunwayJourney(runwayRes.items || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  // Build derived data from fashion_items
  const categories = (() => {
    const counts: Record<string, number> = {}
    for (const item of fashionItems) {
      const cat = item.collection || item.category || 'Other'
      counts[cat] = (counts[cat] || 0) + 1
    }
    return Object.entries(counts).map(([name, count]) => ({ id: name, name, count }))
  })()

  const galleryItems: GalleryItem[] = fashionItems.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description || '',
    category: f.collection || f.category || '',
    image: f.image_url || '',
    location: f.location || '',
    eventDate: f.event_date || '',
    achievement: f.tags?.find((t: string) => ['Winner', 'Finalist', 'Featured', 'Published'].includes(t)) || '',
  }))

  const filteredGallery = galleryItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const fashionProjects = projects.filter((p: FashionProject) => {
    const isFashionCategory = p.category === 'fashion-tech'
    const hasFashionTag = p.tags?.some((t: string) => ['Fashion Tech', 'Modeling'].includes(t))
    const hasFashionTech = p.technologies?.some((t: string) => ['Fashion Tech', '3D Modeling', 'WebGL'].includes(t))
    return isFashionCategory || hasFashionTag || hasFashionTech
  })

  const representation = fashionItems
    .filter((f) => f.collection === 'Representation' || f.tags?.includes('agency'))
    .map((f) => ({ name: f.title, type: f.category || f.collection, since: f.event_date }))

  const stats = {
    totalShoots: fashionItems.length,
    titles: fashionItems.filter(f => f.tags?.some((t: string) => ['Winner', 'Champion', 'Finalist'].includes(t))).length,
    brands: new Set(fashionItems.map(f => f.collection).filter(Boolean)).size,
    categories: categories.length,
  }

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-400 text-lg">Loading fashion portfolio...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Lightbox
        items={filteredGallery}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />

      {/* HERO */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-16 pt-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="inline-flex items-center space-x-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-md">
          <Camera className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium text-pink-400">Fashion & Modeling</span>
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
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="#gallery" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300 group">
            <Camera className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            View Gallery
          </Link>
          <Link href="/fashion/gallery" className="inline-flex items-center px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300 group">
            <Images className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
            Full Photo Gallery
            <ArrowRight className="w-5 h-5 ml-3 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <a href="#booking" className="inline-flex items-center px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-bold hover:bg-white/10 hover:border-pink-500/50 transition-all duration-300">
            Book a Shoot
            <ArrowRight className="w-5 h-5 ml-3 text-gray-400 group-hover:text-white transition-all" />
          </a>
        </div>
      </motion.div>

      {/* QUICK STATS */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
        {[
          { label: 'Total Shoots', value: stats.totalShoots, icon: Camera, color: 'text-pink-500' },
          { label: 'Titles Won', value: stats.titles, icon: Trophy, color: 'text-amber-500' },
          { label: 'Categories', value: stats.categories, icon: Layers, color: 'text-purple-500' },
          { label: 'Milestones', value: runwayJourney.length, icon: TrendingUp, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={stat.label} className="glass-panel p-6 rounded-2xl border border-white/5 text-center hover:border-pink-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2 relative z-10`} />
            <h3 className="text-3xl font-bold text-white mb-2 relative z-10">{stat.value}</h3>
            <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* PROFESSIONAL STATS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Users className="w-8 h-8 mr-4 text-pink-500" />
            Professional Stats
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-semibold text-white mb-6">Physical Attributes</h3>
            <div className="space-y-4">
              {[
                ['Height', '6\'2" (188 cm)'],
                ['Measurements', '40-32-36'],
                ['Shoe Size', '11 US'],
                ['Hair Color', 'Black'],
                ['Eye Color', 'Brown'],
                ['Skin Tone', 'Medium'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-gray-300">
                  <span>{label}</span>
                  <span className="font-mono text-pink-400">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-semibold text-white mb-6">Special Skills</h3>
            <div className="flex flex-wrap gap-3">
              {['Runway Walking', 'Commercial Modeling', 'Pageantry', 'Mentoring', 'Public Speaking', 'Fashion Tech'].map((skill) => (
                <span key={skill} className="px-4 py-2 bg-blue-500/10 text-blue-300 rounded-full text-sm border border-blue-500/20">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* GALLERY */}
      <div id="gallery" className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Eye className="w-8 h-8 mr-4 text-purple-500" />
            Portfolio Gallery
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search portfolio..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
            >
              All ({galleryItems.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.id ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'}`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredGallery.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl glass-panel border border-white/10 hover:border-pink-500/50 transition-all duration-500 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="h-[400px] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 opacity-80" />
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      quality={85}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-pink-500/50" />
                    </div>
                  )}

                  {item.category && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/10">{item.category}</span>
                    </div>
                  )}
                  {item.achievement && (
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-black border border-amber-500/30 flex items-center shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Trophy className="w-3 h-3 mr-1" />{item.achievement}
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-pink-400 transition-colors">{item.title}</h3>
                    {item.description && <p className="text-gray-300 text-sm line-clamp-2 mt-2">{item.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {item.location && <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{item.location}</span>}
                      {item.eventDate && <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" />{item.eventDate}</span>}
                    </div>
                  </div>

                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                    <div className="flex flex-col items-center gap-3">
                      <span className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-medium border border-white/20">View Full Size</span>
                      <div className="flex gap-2">
                        <a
                          href={`https://www.instagram.com/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/fashion' : 'https://www.mohammedabbas.tech/fashion')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-pink-500/50 transition-colors border border-white/20"
                          title="Share on Instagram"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this fashion portfolio! ' + (typeof window !== 'undefined' ? window.location.origin + '/fashion' : 'https://www.mohammedabbas.tech/fashion'))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-green-500/50 transition-colors border border-white/20"
                          title="Share on WhatsApp"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </a>
                        <a
                          href={`https://www.tiktok.com/share?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/fashion' : 'https://www.mohammedabbas.tech/fashion')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-cyan-500/50 transition-colors border border-white/20"
                          title="Share on TikTok"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.51a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.71a8.16 8.16 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.14z"/></svg>
                        </a>
                        <a
                          href={`https://substack.com/share?publication_url=&p=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin + '/fashion' : 'https://www.mohammedabbas.tech/fashion')}&utm_source=substack`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#FF6719]/50 transition-colors border border-white/20"
                          title="Share on Substack"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredGallery.length === 0 && (
          <div className="text-center py-20 glass-panel rounded-3xl border border-white/5">
            <Camera className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Items Found</h3>
            <p className="text-gray-400">Upload portfolio photos via the admin panel to see them here.</p>
          </div>
        )}
      </div>

      {/* RUNWAY JOURNEY */}
      {runwayJourney.length > 0 && (
        <div className="mb-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-white flex items-center">
              <TrendingUp className="w-8 h-8 mr-4 text-pink-500" />
              Runway Journey
            </h2>
            <div className="h-px bg-white/10 flex-1 ml-8" />
          </div>
          <div className="relative border-l-2 border-white/10 ml-4 md:ml-10 space-y-12">
            {runwayJourney.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-8 md:pl-12"
              >
                <div className="absolute left-[-9px] top-2 w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] border-4 border-black" />
                <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <h4 className="text-6xl font-bold text-white">{milestone.year}</h4>
                  </div>
                  <span className="text-pink-400 font-mono text-sm mb-2 block">{milestone.year}</span>
                  <h3 className="text-2xl font-bold text-white mb-3">{milestone.title}</h3>
                  <p className="text-gray-400 mb-6 max-w-2xl">{milestone.description}</p>
                  <div className="flex flex-wrap gap-3">
                    {(milestone.highlights || []).map((highlight) => (
                      <span key={highlight} className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5 flex items-center">
                        <Star className="w-3 h-3 mr-2 text-yellow-500" />{highlight}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* FASHION TECH PROJECTS */}
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
                    <span className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2 block">{project.category}</span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-400 group-hover:-rotate-45 transition-all" />
                </div>
                <p className="text-gray-400 mb-6 line-clamp-2">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {(project.technologies || []).slice(0, 4).map((tech) => (
                    <span key={tech} className="px-3 py-1 rounded bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20">{tech}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* BRAND COLLABORATIONS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Heart className="w-8 h-8 mr-4 text-rose-500" />
            Brand Collaborations
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.filter(c => c.id !== 'Representation').map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-rose-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-rose-500/20">
                  <Sparkles className="w-7 h-7 text-rose-400" />
                </div>
                <div>
                  <h4 className="text-white font-bold group-hover:text-rose-400 transition-colors">{brand.name}</h4>
                  <p className="text-gray-400 text-sm">{brand.count} {brand.count === 1 ? 'item' : 'items'}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* TESTIMONIALS */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Star className="w-8 h-8 mr-4 text-yellow-500" />
            Testimonials
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { quote: "Mohammed brought professionalism and energy to our commercial shoot. His versatility allowed us to capture multiple looks in one session. Highly professional and easy to work with.", name: "Jane Smith", role: "Commercial Photographer" },
            { quote: "As a judge, Mohammed demonstrated deep understanding of runway standards and fair evaluation criteria. His feedback to contestants was constructive and valuable.", name: "Event Director", role: "Kipawa Africa Events" },
            { quote: "Working with Mohammed was a game-changer for our brand. His professionalism and market understanding helped us reach our target audience effectively.", name: "Sarah Johnson", role: "Brand Manager, Glam Haven" },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-yellow-500/30 transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-[60px] pointer-events-none" />
              <div className="flex text-yellow-400 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5" />)}
              </div>
              <p className="text-gray-300 italic mb-6 relative z-10">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center relative z-10">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* REPRESENTATION & COMMERCIAL */}
      {representation.length > 0 && (
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="rounded-3xl glass-panel border border-white/10 p-10 md:p-16 mb-24 relative overflow-hidden">
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
                  {representation.map((agency) => (
                    <div key={agency.name} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <h4 className="text-white font-bold">{agency.name}</h4>
                        <span className="text-sm text-gray-400">{agency.type}</span>
                      </div>
                      {agency.since && <span className="text-xs font-mono text-pink-400 border border-pink-500/20 px-2 py-1 rounded">Since {agency.since}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Commercial Focus</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['Brand Ambassador', 'Product Shoots', 'TV Commercials', 'Social Media', 'Runway', 'Print Media'].map((tag) => (
                    <div key={tag} className="p-3 text-center rounded-lg bg-black/20 border border-white/5 text-gray-300 text-sm hover:text-white hover:border-pink-500/30 transition-colors">{tag}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* RATES & BOOKING */}
      <div id="booking" className="mb-24">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <ExternalLink className="w-8 h-8 mr-4 text-pink-500" />
            Rates & Booking
          </h2>
          <div className="h-px bg-white/10 flex-1 ml-8" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-semibold text-white mb-6">Rates & Availability</h3>
            <div className="space-y-4">
              <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <h4 className="text-lg font-bold text-white mb-1">Commercial Shoot</h4>
                <p className="text-gray-400 text-sm">Full-day commercial modeling session</p>
                <div className="mt-3 flex items-center text-amber-400 font-mono text-sm">
                  <Trophy className="w-4 h-4 mr-2" />$1,500 - $2,500
                </div>
              </div>
              <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <h4 className="text-lg font-bold text-white mb-1">Runway Event</h4>
                <p className="text-gray-400 text-sm">Fashion show or runway appearance</p>
                <div className="mt-3 flex items-center text-blue-400 font-mono text-sm">
                  <Trophy className="w-4 h-4 mr-2" />$800 - $1,500 per show
                </div>
              </div>
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                <h4 className="text-lg font-bold text-white mb-1">Editorial</h4>
                <p className="text-gray-400 text-sm">Magazine or editorial photoshoot</p>
                <div className="mt-3 flex items-center text-green-400 font-mono text-sm">
                  <Trophy className="w-4 h-4 mr-2" />$1,200 - $2,000
                </div>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl border border-white/10 hover:border-pink-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-semibold text-white mb-6">Booking Inquiry</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Inquiry submitted! We will get back to you shortly.') }}>
              <input type="text" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="Your name" required />
              <input type="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500" placeholder="your@email.com" required />
              <select className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option value="">Select booking type</option>
                <option>Commercial Shoot</option>
                <option>Runway Event</option>
                <option>Editorial</option>
                <option>Agency Representation</option>
                <option>Collaboration</option>
                <option>Other</option>
              </select>
              <textarea rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none" placeholder="Tell me about your project..." required></textarea>
              <button type="submit" className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all duration-300">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
